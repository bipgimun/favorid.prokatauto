const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const { passengers } = require('../../wish-list').wishList;

const Joi = require('joi');

const addSchema = Joi.object({
    name: passengers.name.required(),
    contact_number: passengers.contactNumber.required(),
    birthday: passengers.birthday
});

const updateSchema = Joi.object({
    name: passengers.name,
    contact_number: passengers.contactNumber,
    birthday: passengers.birthday
});

app.post('/get', async (req, res, next) => {

    const clients = await db.execQuery(`SELECT * FROM passengers`);

    res.json({ status: 'ok', clients });
})

app.get('/select2', async (req, res, next) => {
    const { search = '' } = req.query;
    const clients = await db.execQuery(`SELECT * FROM passengers WHERE name LIKE '%${safeStr(search)}%'`);
    res.json({ items: clients });
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

    const validValues = await addSchema.validate(values);

    const id = await db.insertQuery(`INSERT INTO passengers SET ?`, validValues);

    validValues.id = id;

    res.json({ status: 'ok', data: validValues });
})


app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = await updateSchema.validate(fields);

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE passengers SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM passengers WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = app;