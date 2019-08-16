const moment = require('moment');
const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');

const {
    customersModel
} = require('../../../models');

app.post('/get', async (req, res, next) => {

    const customers = await customersModel.get();

    res.json({ status: 'ok', customers });
});

app.post('/getOne', async (req, res, next) => {

    const { id = '' } = req.body;

    if (!id)
        throw new Error(messages.missingId);

    const [customer = {}] = await customersModel.get({ id });

    res.json({ status: 'ok', data: customer });
})

app.post('/add', async (req, res, next) => {

    const { values } = req.body;

    const validValues = await wishList.customers.validate(values);


    const id = await db.insertQuery(`INSERT INTO customers SET ?`, validValues);

    validValues.id = id;
    validValues.is_legal_entity = validValues.is_legal_entity == '1' ? 'Юридическре лицо' : 'Физ. лицо'

    res.json({ status: 'ok', data: validValues });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = await wishList.customers.validate(fields);

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE customers SET ? WHERE id = ?`, [validValues, id]);

    if (validValues.birthday)
        validValues.birthday = moment(validValues.birthday).format('DD.MM.YYYY');

    if (validValues.driver_license_issue_date)
        validValues.driver_license_issue_date = moment(validValues.driver_license_issue_date).format('DD.MM.YYYY');

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