const express = require('express');
const moment = require('moment');

const app = express.Router();

const checkAuth = require('../../../libs/middlewares/check-auth');
const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const Joi = require('joi');

const statues = {
    '0': 'Новая заявка',
    '1': 'В работе',
    '2': 'Завершена'
};

const addScheme = Joi.object({
    manager_id: Joi.number().required(),
    customer_id: Joi.number().required(),
    discount: Joi.number().default(0).empty(''),
    passenger_id: Joi.number().required(),
    contact_number: Joi.string().required(),
    driver_id: Joi.number().empty([null, '']),
    itinerarie_id: Joi.number().empty([null, '']),
    price_id: Joi.number().required(),
    car_id: Joi.number().required(),
    class_name: Joi.string().required(),
    rent_start: Joi.string().required(),
    rent_finished: Joi.string().required(),
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
            driver_id: Joi.required(),
            itinerarie_id: Joi.required(),
        }),
        otherwise: Joi.object({
            driver_id: Joi.strip(),
            itinerarie_id: Joi.strip(),
        })
    })

const updateSchema = Joi.object({
    manager_id: Joi.number(),
    customer_id: Joi.number(),
    discount: Joi.number().default(0).empty(''),
    passenger_id: Joi.number(),
    contact_number: Joi.string(),
    driver_id: Joi.number().allow(''),
    itinerarie_id: Joi.number().allow('').error(new Error('Выберите маршрут')),
    price_id: Joi.number(),
    car_id: Joi.number(),
    class_name: Joi.string(),
    rent_start: Joi.string(),
    rent_finished: Joi.string(),
    services: Joi.string(),
    prepayment: Joi.number().min(0),
    sum: Joi.number().min(0),
    comment: Joi.string().allow(''),
    has_driver: Joi.number().default(0).valid([0, 1]),
    driver_salary: Joi.number().min(0).default(0).empty(''),
    status: Joi.number(),
}).when(
    Joi.object({
        has_driver: Joi.number().valid(1).required()
    }).unknown(), {
        then: Joi.object({
            driver_id: Joi.required(),
            itinerarie_id: Joi.required(),
        }),
        otherwise: Joi.object({
            driver_id: Joi.strip(),
            itinerarie_id: Joi.strip(),
        })
    })

app.post('/add', async (req, res, next) => {

    const { values } = req.body;
    const { id: manager_id } = req.session.user;

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

app.post('/update', async (req, res, next) => {
    const { id, ...fields } = req.body.values;

    const validValues = await updateSchema.validate(fields);

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE cars_reservations SET ? WHERE id = ?`, [validValues, id]);

    const [item = {}] = await db.execQuery(`
          SELECT cr.*,
            c.name as car_name,
            c.model as car_model,
            c.number as car_number,
            cu.name as customer_name,
            cu.discount as customer_discount,
            p.name as passenger_name,
            d.name as driver_name,
            i.name as itinerarie_name
        FROM cars_reservations cr
            LEFT JOIN cars c ON c.id = cr.car_id
            LEFT JOIN customers cu ON cu.id = cr.customer_id
            LEFT JOIN passengers p ON p.id = cr.passenger_id
            LEFT JOIN drivers d ON d.id = cr.driver_id
            LEFT JOIN cars_price cp ON cp.id = cr.price_id
            LEFT JOIN itineraries i ON i.id = cr.itinerarie_id
        WHERE cr.id = ?`, [id]);


    validValues.status_name = statues[validValues.status];

    const returnData = { ...validValues, ...item };

    res.json({ status: 'ok', data: returnData });

});

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM cars_reservations WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = app;