const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const { carsPrice: carsPriceModel } = require('../../../models');

app.post('/get', async (req, res, next) => {

    const carsPrice = await carsPriceModel.get();

    return res.json({ status: 'ok', data: carsPrice });
})

app.post('/get/:id', async (req, res, next) => {

    const { id } = req.params;

    if (!Number(id))
        throw new Error('Отсутствует id');

    const [carsPrice = {}] = await carsPriceModel.get({ id });

    if (!carsPrice.id)
        throw new Error('Позиция не найдена');

    return res.json({ status: 'ok', data: carsPrice });
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

    const id = await db.insertQuery(`INSERT INTO cars_price SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
});

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.carsPrice.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE cars_price SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM cars_price WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = app;