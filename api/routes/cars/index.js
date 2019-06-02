const express = require('express');
const moment = require('moment');

const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const Joi = require('joi');

const addSchema = Joi.object({
    name: Joi.string().required(),
    model: Joi.string().required(),
    class_name: Joi.string().required(),
    price_per_day: Joi.number().required(),
    deposit: Joi.number().required(),
    limit_per_day: Joi.number().required(),
    surcharge: Joi.number().required(),
    number: Joi.string().required(),
    mileage: Joi.number().required(),
    carcass_condition: Joi.string().required(),
    release_date: Joi.date().required(),
    fuel_level: Joi.number().required(),
    osago_number: Joi.string().required(),
    osago_expiration_date: Joi.date().required(),
    maintenance: Joi.number().required(),
    market_price: Joi.number().required(),
    purchase_price: Joi.number().required(),
    in_leasing: Joi.number().default(0).valid([1, 0]),
    payment_amount: Joi.number().not(['']),
    payment_date: Joi.date().not(['']),
    company_property: Joi.number().default(0).when('in_leasing', { is: Joi.valid(1).required(), then: Joi.required() }),
    leasing_expiration_date: Joi.date(),
}).when(
    Joi.object({
        in_leasing: Joi.number().valid(1).required()
    }).unknown(), {
        then: Joi.object().with('in_leasing', [
            'payment_amount',
            'payment_date',
            'leasing_expiration_date'
        ]),
        otherwise: Joi.object({
            payment_amount: Joi.strip(),
            payment_date: Joi.strip(),
            leasing_expiration_date: Joi.strip()
        })
    })

const updateSchema = Joi.object({
    name: Joi.string(),
    model: Joi.string(),
    class_name: Joi.string(),
    price_per_day: Joi.number(),
    deposit: Joi.number(),
    limit_per_day: Joi.number(),
    surcharge: Joi.number(),
    number: Joi.string(),
    mileage: Joi.number(),
    carcass_condition: Joi.string(),
    release_date: Joi.date(),
    fuel_level: Joi.number(),
    osago_number: Joi.string(),
    osago_expiration_date: Joi.date(),
    maintenance: Joi.number(),
    market_price: Joi.number(),
    purchase_price: Joi.number(),
    in_leasing: Joi.number().default(0).valid([1, 0]),
    payment_amount: Joi.number().not(['']),
    payment_date: Joi.date().not(['']),
    company_property: Joi.number().default(0).when('in_leasing', { is: Joi.valid(1).required(), then: Joi.required() }),
    leasing_expiration_date: Joi.date(),
}).when(
    Joi.object({
        in_leasing: Joi.number().valid(1).required()
    }).unknown(), {
        then: Joi.object().with('in_leasing', [
            'payment_amount',
            'payment_date',
            'leasing_expiration_date'
        ]),
        otherwise: Joi.object({
            payment_amount: Joi.any().default(null),
            payment_date: Joi.any().default(null),
            leasing_expiration_date: Joi.any().default(null)
        })
    }
)

app.post('/add', async (req, res, next) => {

    const { values } = req.body;

    const validValues = await addSchema.validate(values);

    const id = await db.insertQuery(`INSERT INTO cars SET ?`, validValues);

    validValues.id = id;

    res.json({ status: 'ok', data: validValues });
})

app.post('/get', async (req, res, next) => {

    const {
        name = '',
        model = '',
    } = req.body;

    const cars = await db.execQuery(`
        SELECT c.*
        FROM cars c
        WHERE c.id > 0
            ${safeStr(name) ? `AND c.name = '${name}'` : ''}
            ${safeStr(model) ? `AND c.model = '${model}'` : ''}
    `);

    return res.json({ status: 'ok', data: cars });
});

app.post('/get/:id', async (req, res, next) => {

    const { id } = req.params;

    if (!Number(id))
        throw new Error('Неверный id');

    const {
        name = '',
        model = '',
    } = req.body;

    const [cars = {}] = await db.execQuery(`
        SELECT c.*
        FROM cars c
        WHERE c.id > 0
            ${safeStr(name) ? `AND c.name = '${name}'` : ''}
            ${safeStr(model) ? `AND c.model = '${model}'` : ''}
            ${id ? `AND c.id = ${id}` : ``}
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

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    if (!id)
        throw new Error(messages.missingId);

    const validValues = await updateSchema.validate(fields);

    await db.execQuery(`UPDATE cars SET ? WHERE id = ?`, [validValues, id]);

    if (typeof validValues.in_leasing !== 'undefined') {
        if (validValues.in_leasing == '1') {
            validValues.in_leasing_name = 'Лизинг';
        } else {
            validValues.in_leasing_name = 'Не лизинг';
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

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM cars WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = app;