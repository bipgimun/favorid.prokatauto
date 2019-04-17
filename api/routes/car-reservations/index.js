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
    customer_id: Joi.number().required(),
    discount: Joi.number().default(0).empty(''),
    passenger_id: Joi.number().required(),
    contact_number: Joi.string().required(),
    driver_id: Joi.number().empty([null, '']),
    itinerarie_id: Joi.number().empty([null, '']),
    price_id: Joi.number().required(),
    car_id: Joi.number().required(),
    class_name: Joi.string().required(),
    cash_storage_id: Joi.number().required(),
    services: Joi.string(),
    prepayment: Joi.number().min(0).required(),
    sum: Joi.number().min(0).required(),
    comment: Joi.string().empty([null, '']),
    has_driver: Joi.number()
}).with('has_driver', ['driver_id', 'itinerarie_id']);

app.post('/add', async (req, res, next) => {

    const { values } = req.body;

    const { has_driver, ...validValues } = await Joi.validate(values, addScheme);

    const id = await db.insertQuery(`INSERT INTO cars_reservations SET ?`, validValues);

    validValues.id = id;
    validValues.status_name = statues['0'];

    res.json({ status: 'ok', data: validValues });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.carReservation.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

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
            i.name as itinerarie_name,
            cs.name as cash_storage_name
        FROM cars_reservations cr
            LEFT JOIN cars c ON c.id = cr.car_id
            LEFT JOIN customers cu ON cu.id = cr.customer_id
            LEFT JOIN passengers p ON p.id = cr.passenger_id
            LEFT JOIN drivers d ON d.id = cr.driver_id
            LEFT JOIN cars_price cp ON cp.id = cr.price_id
            LEFT JOIN itineraries i ON i.id = cr.itinerarie_id
            LEFT JOIN cash_storages cs ON cs.id = cr.cash_storage_id
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