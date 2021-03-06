const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');

app.post('/get', async (req, res, next) => {

    const storages = await db.execQuery(`SELECT * FROM cash_storages`);

    res.json({ status: 'ok', data: storages });
})

app.get('/select2', async (req, res, next) => {
    const { search = '' } = req.query;
    const storages = await db.execQuery(`SELECT * FROM cash_storages WHERE name LIKE '%${safeStr(search)}%'`);

    res.json({ items: storages });
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

    const id = await db.insertQuery(`INSERT INTO cash_storages SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.cashStorages.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE cash_storages SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM cash_storages WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = app;