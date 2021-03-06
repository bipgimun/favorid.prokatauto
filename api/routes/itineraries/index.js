const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const moment = require('moment');

const { itineraries: itinerariesModel } = require('../../../models');

app.post('/get', async (req, res, next) => {
    const itineraries = await itinerariesModel.get();

    return res.json({ status: 'ok', data: itineraries });
})

app.get('/select2', async (req, res, next) => {
    const itineraries = await itinerariesModel.get();
    return res.json({ items: itineraries });
})

app.post('/getOne', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('Отсутствует id');

    const [itineraries = {}] = await itinerariesModel.get({ id });

    if (!itineraries.id)
        throw new Error('Маршрут не найден');

    return res.json({ status: 'ok', data: itineraries });
})

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

    const id = await db.insertQuery(`INSERT INTO itineraries SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.itineraries.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE itineraries SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM itineraries WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = app;