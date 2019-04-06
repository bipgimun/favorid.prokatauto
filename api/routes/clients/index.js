const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');

app.post('/get', async (req, res, next) => {

    const clients = await db.execQuery(`SELECT * FROM passengers`);

    res.json({ status: 'ok', clients });
})

app.post('/getOne', async (req, res, next) => {

    const { id = '' } = req.body;

    if (!id)
        throw new Error(messages.missingId);

    const [client = {}] = await db.execQuery(`SELECT * FROM passengers WHERE id = ?`, [id]);

    res.json({ status: 'ok', client });
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

    const id = await db.insertQuery(`INSERT INTO passengers SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})


app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.passengers.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE passengers SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

module.exports = app;