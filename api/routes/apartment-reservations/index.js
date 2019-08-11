const smsSend = require('../../../libs/smsSend');
const nodemailer = require('nodemailer');

const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const apartments_statuses = require('../../../config/apartment-statuses');
const moment = require('moment');

const Joi = require('joi');

const {
    apartmentsReservsModel,
    customersModel,
    apartmentsModel,
} = require('../../../models');

const addSchema = Joi.object({
    manager_id: Joi.number().required(),
    apartment_id: Joi.number().required(),
    customer_id: Joi.number().required(),
    passenger_id: Joi.number().required(),
    number_of_clients: Joi.number().min(1).required(),
    prepayment: Joi.number().required(),
    services: Joi.string().empty([null, '']),
    number_days: Joi.number().required(),
    price_per_day: Joi.number().required(),
    contact_number: Joi.string().required(),
    discount: Joi.number().required(),
    comment: Joi.string().empty([null, '']),
    sum: Joi.number().required(),
    entry: Joi.string().required(),
    departure: Joi.string().required(),
})

const updateSchema = Joi.object({
    apartment_id: Joi.number(),
    customer_id: Joi.number(),
    passenger_id: Joi.number(),
    number_of_clients: Joi.number().min(1),
    prepayment: Joi.number(),
    services: Joi.string().allow(''),
    number_days: Joi.number(),
    price_per_day: Joi.number(),
    contact_number: Joi.string(),
    discount: Joi.number(),
    comment: Joi.string().allow(''),
    sum: Joi.number(),
    status: Joi.number(),
    entry: Joi.string(),
    departure: Joi.string(),
})

app.post('/get', async (req, res, next) => {

    const {
        fromPeriod,
        endPeriod,
        apartment_id,
        passenger_id,
        manager_id,
        customer } = req.body;

    const reservs = await apartmentsReservsModel.get({
        fromPeriod,
        endPeriod,
        customer,
        passenger_id,
        apartment_id,
        manager_id
    });

    return res.json({ status: 'ok', data: reservs });
})

app.post('/add', async (req, res, next) => {

    const { values } = req.body;
    const { employee_id: manager_id } = req.session.user;

    Object.assign(values, { manager_id });

    const validValues = await addSchema.validate(values);

    const { apartment_id: apId } = validValues;

    const apInWorks = await db.execQuery(`
        SELECT id, entry, departure
        FROM apartment_reservations 
        WHERE 
            apartment_id = ${apId} 
            AND status NOT IN (0, 3)
            AND (
                ((entry BETWEEN '${validValues.entry}' AND '${validValues.departure}') OR (departure BETWEEN '${validValues.entry}' AND '${validValues.departure}'))
                OR (('${validValues.entry}' BETWEEN entry AND departure) AND ('${validValues.departure}' BETWEEN entry AND departure))
            )
    `);

    if (apInWorks.length > 0)
        throw new Error('Данная квартира уже находится в работе');

    const id = await db.insertQuery(`INSERT INTO apartment_reservations SET ?`, validValues);

    const [ar = {}] = await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
        WHERE ar.id = ?`, [id]
    );

    ar.statusName = apartments_statuses.get(1);
    ar.created_at = moment(ar.created_at).format('DD.MM.YYYY');

    res.json({ status: 'ok', data: ar });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = await updateSchema.validate(fields);

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    if (new Date(validValues.entry) >= new Date(validValues.departure))
        throw new Error('Дата въезда не должна быть позднее даты выезда');


    if (validValues.apartment_id) {
        const apInWorks = await db.execQuery(`
            SELECT id, entry, departure
            FROM apartment_reservations 
            WHERE
                id <> ${id}
                AND apartment_id = ${validValues.apartment_id} 
                AND status NOT IN (0, 3)
                AND (
                    ((entry BETWEEN '${validValues.entry}' AND '${validValues.departure}') OR (departure BETWEEN '${validValues.entry}' AND '${validValues.departure}'))
                    OR (('${validValues.entry}' BETWEEN entry AND departure) AND ('${validValues.departure}' BETWEEN entry AND departure))
                )
        `);

        if (apInWorks.length > 0)
            throw new Error('В указанное время квартира забронирована');
    }

    await db.execQuery(`UPDATE apartment_reservations SET ? WHERE id = ?`, [validValues, id]);

    if (typeof validValues.status !== 'undefined') {
        validValues.status_name = apartments_statuses.get(+validValues.status);
    }

    const [item = {}] = await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name,
            c.name as customer_name,
            p.contact_number as client_number
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
            LEFT JOIN customers c ON ar.customer_id = c.id
        WHERE
            ar.id = ?
    `, [id])

    if (validValues.entry) {
        validValues.entry = moment(validValues.entry).format('DD.MM.YYYY в HH:mm');
    }

    if (validValues.departure) {
        validValues.departure = moment(validValues.departure).format('DD.MM.YYYY в HH:mm');
    }

    validValues.status_name = apartments_statuses.get([+item.status]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM apartment_reservations WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})


app.post('/sendNotify', async (req, res, next) => {
    const { id, sms, email } = req.body;

    if (!id) {
        throw new Error('Ошибка входных данных: отсутствует id');
    }

    const [reserv = {}] = await apartmentsReservsModel.get({ id });

    if (!reserv.id) {
        throw new Error('Заявка не найдена');
    }

    const [customer = {}] = await customersModel.get({ id: reserv.customer_id });

    if (!customer.id) {
        throw new Error('Заказчик не найден');
    }

    const [apartment = {}] = await apartmentsModel.get({ id: reserv.apartment_id });

    if (!apartment.id) {
        throw new Error('Квартира не найдена');
    }

    const e = moment(reserv.entry);
    const d = moment(reserv.departure);

    const errors = [];
    const message = 'Для вашей заявки № ' + id + ' назначены апартаменты - ' + apartment.address + '. '
        + 'Заезд ' + e.format('DD.MM.YYYY') + ' в ' + e.format('hh:mm')
        + '. Выезд ' + d.format('DD.MM.YYYY') + ' в ' + e.format('hh:mm') + '. Телефон для связи +7-919-301-50-59, Сергей Викторович';

    if (sms == '1') {

        if (!reserv.contact_number) {
            errors.push(new Error('У заказчика не установлен номер телефона'));
        } else {
            const phone = reserv.contact_number.replace(/\D/g, '');

            const smsData = await smsSend.send(phone, message, { from: 'ABV Hotel' });

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
                    user: 'hotel-mgn@mail.ru',
                    pass: '174174mgn'
                }
            });

            await transporter.sendMail({
                from: '"ABV Hotel" <hotel-mgn@mail.ru>', // sender address
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

module.exports = app;