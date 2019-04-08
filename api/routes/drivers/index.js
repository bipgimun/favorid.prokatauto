const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const moment = require('moment');

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

    const id = await db.insertQuery(`INSERT INTO drivers SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.drivers.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE drivers SET ? WHERE id = ?`, [validValues, id]);

    if (validValues.birthday) {
        validValues.birthday = moment(validValues.birthday).format('DD.MM.YYYY');
    }

    if (validValues.license_date_issue) {
        validValues.license_date_issue = moment(validValues.license_date_issue).format('DD.MM.YYYY');
    }

    if (validValues.license_date_expiration) {
        validValues.license_date_expiration = moment(validValues.license_date_expiration).format('DD.MM.YYYY');
    }

    if (validValues.passport_date_issue) {
        validValues.passport_date_issue = moment(validValues.passport_date_issue).format('DD.MM.YYYY');
    }

    if (validValues.car_id) {
        const [car = {}] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [validValues.car_id]);
        validValues.car_name = `${car.name} ${car.model}`;
    }

    res.json({ status: 'ok', data: validValues });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM drivers WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = app;