const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const apartments_statuses = require('../../../config/apartment-statuses');
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

    const { apartment_id: apId } = values;

    const apInWorks = await db.execQuery('SELECT * FROM apartment_reservations WHERE apartment_id = ? AND status NOT IN (0, 3)', [apId]);

    if (apInWorks.length > 0)
        throw new Error('Данная квартира уже находится в работе');

    const id = await db.insertQuery(`INSERT INTO apartment_reservations SET ?`, values);

    const [ap = {}] = await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
        WHERE ar.id = ?`, [id]
    );

    ap.statusName = apartments_statuses.get(0);
    ap.created_at = moment(ap.created_at).format('DD.MM.YYYY');

    res.json({ status: 'ok', data: ap });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.apartmentReservations.includes(field) && fields[field].trim())
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE apartment_reservations SET ? WHERE id = ?`, [validValues, id]);

    if (typeof validValues.status !== 'undefined') {
        validValues.status_name = apartments_statuses.get(+validValues.status);
    }

    const [item = {}] = await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name,
            c.name as customer_name,
            p.contact_number as client_number,
            cs.name as cash_storage
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
            LEFT JOIN customers c ON ar.customer_id = c.id
            LEFT JOIN cash_storages cs ON ar.cash_storage_id = cs.id
        WHERE
            ar.id = ?
    `, [id])

    if (validValues.entry) {
        validValues.entry = moment(validValues.entry).format('DD.MM.YYYY в HH:mm');
    }

    if (validValues.departure) {
        validValues.departure = moment(validValues.departure).format('DD.MM.YYYY в HH:mm');
    }

    validValues.status_name = apartments_statuses.get([+item.status]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM apartment_reservations WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = app;