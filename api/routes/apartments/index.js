const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const apartments_statuses = require('../../../config/apartment-statuses');

app.post('/get', async (req, res, next) => {

    const apartments = await db.execQuery(`SELECT * FROM apartments`);

    res.json({ status: 'ok', apartments });
})

app.post('/getOne', async (req, res, next) => {

    const { id = '' } = req.body;

    if (!id)
        throw new Error(messages.missingId);


    const [apartment = {}] = await db.execQuery(`SELECT * FROM apartments WHERE id = ?`, [id]);

    res.json({ status: 'ok', apartment });
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

    const id = await db.insertQuery(`INSERT INTO apartments SET ?`, values);

    const [apartment = {}] = await db.execQuery(`SELECT * FROM apartments WHERE id = ?`, [id]);

    apartment.statusName = apartments_statuses.get(0);

    res.json({ status: 'ok', data: apartment });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.apartments.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE apartments SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

module.exports = app;