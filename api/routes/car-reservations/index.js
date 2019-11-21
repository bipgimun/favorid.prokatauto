const express = require('express');
const moment = require('moment');

const router = express.Router();

const checkAuth = require('../../../libs/middlewares/check-auth');
const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const Joi = require('joi');

const {
    carsReservsModel,
    customersModel,
    drivers: driversModel,
    carsModel
} = require('../.././../models');

const smsSend = require('../../../libs/smsSend');
const nodemailer = require('nodemailer');

const statues = {
    '0': 'Новая заявка',
    '1': 'В работе',
    '2': 'Завершена'
};

const addScheme = Joi.object({
    manager_id: Joi.number().required(),
    car_deposit: Joi.number().default(0),
    paid_sum: Joi.number().default(0),
    customer_id: Joi.number().required(),
    discount: Joi.number().default(0).empty(''),
    passenger_id: Joi.number().empty([null]),
    contact_number: Joi.string().required(),
    driver_id: Joi.number().empty([null, '']).default(null),
    itinerarie_id: Joi.number().empty([null, '']),
    car_id: Joi.number().required(),
    class_name: Joi.string().required(),
    rent_start: Joi.string().required(),
    rent_finished: Joi.string().required(),
    itinerarie_point_a: Joi.string(),
    itinerarie_point_b: Joi.string(),
    services: Joi.string(),
    prepayment: Joi.number().min(0).required(),
    sum: Joi.number().min(0).required(),
    comment: Joi.string().empty([null, '']),
    has_driver: Joi.number().default(0).valid([0, 1]),
    driver_salary: Joi.number().default(0),
}).when(
    Joi.object({
        has_driver: Joi.number().valid(1).required()
    }).unknown(), {
    then: Joi.object({
        driver_id: Joi.any().default(null),
        itinerarie_id: Joi.required(),
    }),
    otherwise: Joi.object({
        itinerarie_id: Joi.strip(),
    })
})

const updateSchema = Joi.object({
    manager_id: Joi.number(),
    customer_id: Joi.number(),
    car_deposit: Joi.number(),
    paid_sum: Joi.number(),
    discount: Joi.number().empty(''),
    passenger_id: Joi.number(),
    contact_number: Joi.string(),
    driver_id: Joi.number().allow(''),
    itinerarie_id: Joi.number().allow('').error(new Error('Выберите маршрут')),
    car_id: Joi.number(),
    class_name: Joi.string(),
    rent_start: Joi.string(),
    rent_finished: Joi.string(),
    itinerarie_point_a: Joi.string(),
    itinerarie_point_b: Joi.string(),
    services: Joi.string(),
    prepayment: Joi.number().min(0),
    sum: Joi.number().min(0),
    comment: Joi.string().allow(''),
    has_driver: Joi.number().valid([0, 1]),
    driver_salary: Joi.number().min(0).empty(''),
    status: Joi.number(),
    reserv_mileage: Joi.number(),
    reserv_fuel_level: Joi.number(),
}).when(
    Joi.object({
        has_driver: Joi.number().valid(1).required()
    }).unknown(), {
    then: Joi.object({
        driver_id: Joi.any().default(null),
        itinerarie_id: Joi.required(),
    }),
    otherwise: Joi.object({
        driver_id: Joi.strip(),
        itinerarie_id: Joi.strip(),
    })
})

router.post('/get', async (req, res, next) => {

    const {
        fromPeriod,
        endPeriod,
        customer,
        withDriver,
        driver,
        passenger,
        car,
        manager,
        withoutDriver } = req.body;

    let hasDriver = '';

    if (withDriver == '1' && withoutDriver == '0')
        hasDriver = '1';

    if (withDriver == '0' && withoutDriver == '1')
        hasDriver = '0';

    const reservs = await carsReservsModel.get({
        fromPeriod, endPeriod, customer, hasDriver,
        driver_id: driver, passenger_id: passenger, car_id: car, manager_id: manager
    });

    return res.json({ status: 'ok', data: reservs });
})

router.post('/add', async (req, res, next) => {

    const { values } = req.body;
    const { employee_id: manager_id } = req.session.user;

    Object.assign(values, { manager_id });

    const validValues = await Joi.validate(values, addScheme);

    const carInWorks = await db.execQuery(`
        SELECT id
        FROM cars_reservations 
        WHERE 
            car_id = ${values.car_id} 
            AND status NOT IN (3)
            AND (
                ((rent_start BETWEEN '${values.rent_start}' AND '${values.rent_finished}') OR (rent_finished BETWEEN '${values.rent_start}' AND '${values.rent_finished}'))
                OR (('${values.rent_start}' BETWEEN rent_start AND rent_finished) AND ('${values.rent_finished}' BETWEEN rent_start AND rent_finished))
            )
    `);

    if (carInWorks.length > 0)
        throw new Error('Данный автомобиль в это время уже находится в аренде');

    if (values.driver_id) {
        const driversInWork = await db.execQuery(`
            SELECT id
            FROM cars_reservations 
            WHERE 
                driver_id = ${values.driver_id} 
                AND status NOT IN (3)
                AND (
                    ((rent_start BETWEEN '${values.rent_start}' AND '${values.rent_finished}') OR (rent_finished BETWEEN '${values.rent_start}' AND '${values.rent_finished}'))
                    OR (('${values.rent_start}' BETWEEN rent_start AND rent_finished) AND ('${values.rent_finished}' BETWEEN rent_start AND rent_finished))
                )
        `);

        if (driversInWork.length > 0)
            throw new Error('Данный водитель в это время находится в работе');
    }

    const id = await db.insertQuery(`INSERT INTO cars_reservations SET ?`, validValues);

    validValues.id = id;
    validValues.status_name = statues['0'];

    res.json({ status: 'ok', data: validValues });
})

router.post('/update', async (req, res, next) => {
    const { id, ...fields } = req.body.values;

    const validValues = await updateSchema.validate(fields);

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    if (validValues.status && validValues.status == 2) {
        const [reserv] = await carsReservsModel.get({ id });

        if (!reserv)
            throw new Error('Заявка не найдена');

        if (reserv.has_driver == '1' && !reserv.driver_id) {
            throw new Error('Нельзя завершить заявку с водителем без указания водителя');
        }

        if (reserv.car_id && reserv.reserv_fuel_level) {
            await db.execQuery(`UPDATE cars SET ? WHERE id = ?`, [{ fuel_level: reserv.reserv_fuel_level }, reserv.car_id]);
        }
       
        if (reserv.car_id && reserv.reserv_mileage) {
            await db.execQuery(`UPDATE cars SET ? WHERE id = ?`, [{ mileage: reserv.reserv_mileage }, reserv.car_id]);
        }

        validValues.close_at = new Date();
    }

    await carsReservsModel.update({ id, values: validValues });

    const [item] = await carsReservsModel.get({ id });

    if (!item)
        throw new Error('Заявка не найдена');

    validValues.status_name = statues[validValues.status];
    item.rent_start = moment(item.rent_start).format('DD.MM.YYYY в HH:mm');
    item.rent_finished = moment(item.rent_finished).format('DD.MM.YYYY в HH:mm');

    const returnData = { ...validValues, ...item };

    res.json({ status: 'ok', data: returnData });

});

router.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM cars_reservations WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

router.post('/sendNotify', async (req, res, next) => {
    const { id, sms, email } = req.body;

    if (!id) {
        throw new Error('Ошибка входных данных: отсутствует id');
    }

    const [reserv = {}] = await carsReservsModel.get({ id });

    if (!reserv.id) {
        throw new Error('Заявка не найдена');
    }

    const [customer = {}] = await customersModel.get({ id: reserv.customer_id });

    if (!customer.id) {
        throw new Error('Заказчик не найден');
    }

    if (reserv.has_driver != '1') {
        throw new Error('Уведомления доступны для заявок с водителем');
    }

    if (!reserv.driver_id) {
        throw new Error('Для заявки не назначен водитель');
    }

    const [driver = {}] = await driversModel.get({ id: reserv.driver_id });

    if (!driver.id) {
        throw new Error('Водитель не найден');
    }

    if (!reserv.car_id) {
        throw new Error('В заявке не указан автомобиль');
    }

    const [car = {}] = await carsModel.get({ id: reserv.car_id });

    if (!car.id) {
        throw new Error('Автомобиль не найден');
    }

    const errors = [];
    const message = 'Для вашей заявки № ' + id + ' назначен водитель - '
        + driver.name + '. Телефон для связи ' + driver.contact_number
        + '. Машина ' + car.name + ', ' + car.model + ', ' + car.number + '.';

    if (sms == '1') {

        if (!reserv.contact_number) {
            errors.push(new Error('У заказчика не установлен номер телефона'));
        } else {
            const phone = reserv.contact_number.replace(/\D/g, '');
            // const phone = reserv.contact_number.replace(/\D/g, '');


            const smsData = await smsSend.send(phone, message, { from: 'prokatautom' });

            if (smsData.status == 'OK') {
                for (const phone of Object.keys(smsData.sms)) {
                    const d = smsData.sms[phone];

                    await db.insertQuery(`INSERT INTO sms_notifications SET ?`, {
                        phone,
                        message: message,
                        customer_id: reserv.customer_id,
                        sms_id: d.status === 'OK' ? d.sms_id : null,
                        status: d.status,
                        error: d.status !== 'OK' ? d.status_text : null,
                        cost: d.cost || 0
                    });

                    if (d.status !== 'OK') {
                        errors.push(new Error(`Не удалось отправить сообщение на номер ${phone}: ${d.status_text}`));
                    }
                }
            } else {
                errors.push(new Error('Не удалось отправить SMS сообщение: не удалось установить связь с сервером'));
            }
        }
    }


    if (email == '1') {

        if (!customer.email) {
            errors.push(new Error('У заказчика отсутствует email'));
        } else {
            let transporter = nodemailer.createTransport({
                host: 'smtp.mail.ru',
                port: 465,
                from: 'hotel-mgn@mail.ru',
                auth: {
                    user: 'hotel-mgn@mail.ru', // generated ethereal user
                    pass: '174174mgn' // generated ethereal password
                }
            });

            await transporter.sendMail({
                from: '"avtoprokat74" <hotel-mgn@mail.ru>', // sender address
                to: customer.email, // list of receivers
                subject: "Заявка №" + id, // Subject line
                text: message, // plain text body
            });
        }

    }

    res.json({
        status: 'ok',
        errors: errors.join('\n')
    });
});

module.exports = router;