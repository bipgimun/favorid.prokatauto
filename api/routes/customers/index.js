const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');

app.post('/get', async (req, res, next) => {

    const customers = await db.execQuery(`SELECT * FROM customers`);

    res.json({ status: 'ok', customers });
});

app.post('/getOne', async (req, res, next) => {

    const { id = '' } = req.body;

    if (!id)
        throw new Error(messages.missingId);

    const [customer = {}] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [id]);

    res.json({ status: 'ok', data: customer });
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

    const id = await db.insertQuery(`INSERT INTO customers SET ?`, values);

    values.id = id;
    values.is_legal_entity = values.is_legal_entity == '1' ? 'Юридическре лицо' : 'Физ. лицо'

    res.json({ status: 'ok', data: values });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.customers.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE customers SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM customers WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = app;