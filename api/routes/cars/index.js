const express = require('express');
const moment = require('moment');

const app = express.Router();

const checkAuth = require('../../../libs/middlewares/check-auth');
const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');

app.post('/add', async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const id = await db.insertQuery(`INSERT INTO cars SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/get', async (req, res, next) => {

    const {
        name = '',
        model = '',
    } = req.body;

    const cars = await db.execQuery(`
        SELECT c.*,
            cp.class_name
        FROM cars c
            LEFT JOIN cars_price cp ON cp.name = c.name AND cp.model = c.model
        WHERE c.id > 0
            ${safeStr(name) ? `AND c.name = '${name}'` : ''}
            ${safeStr(model) ? `AND c.model = '${model}'` : ''}
    `);

    return res.json({ status: 'ok', data: cars });
});

app.post('/getNames', async (req, res, next) => {

    const { search = '' } = req.body;

    const names = await db.execQuery(`
        SELECT DISTINCT name 
        FROM cars 
        WHERE id > 0
            AND name LIKE '%${safeStr(search)}%'
        GROUP BY name
    `);

    res.json({ status: 'ok', data: names });
});

app.post('/getModels', async (req, res, next) => {

    const { name = '' } = req.body;

    const models = await db.execQuery(`
        SELECT DISTINCT model 
        FROM cars
            WHERE id > 0
            ${name ? `AND name = '${safeStr(name)}'` : ''}
    `);

    res.json({ status: 'ok', data: models });
});

app.post('/cars/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.cars.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE cars SET ? WHERE id = ?`, [validValues, id]);

    if (validValues.in_leasing) {
        if (validValues.in_leasing === '1') {
            validValues.in_leasing = 'Лизинг';
        } else {
            validValues.in_leasing = 'Не лизинг';
        }
    }

    if (validValues.release_date) {
        validValues.release_date = moment(validValues.release_date).format('DD.MM.YYYY');
    }

    if (validValues.osago_expiration_date) {
        validValues.osago_expiration_date = moment(validValues.osago_expiration_date).format('DD.MM.YYYY');
    }

    if (validValues.payment_date) {
        validValues.payment_date = moment(validValues.payment_date).format('DD.MM.YYYY');
    }

    if (validValues.leasing_expiration_date) {
        validValues.leasing_expiration_date = moment(validValues.leasing_expiration_date).format('DD.MM.YYYY');
    }

    res.json({ status: 'ok', data: validValues });
});

module.exports = app;