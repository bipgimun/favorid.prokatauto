const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const apartments_statuses = require('../../../config/apartment-statuses');
const moment = require('moment');

const Joi = require('joi');

const { apartmentsReservsModel } = require('../../../models');

const addSchema = Joi.object({
    manager_id: Joi.number().required(),
    apartment_id: Joi.number().required(),
    customer_id: Joi.number().required(),
    passenger_id: Joi.number().required(),
    number_of_clients: Joi.number().min(1).required(),
    prepayment: Joi.number().required(),
    services: Joi.string().empty([null, '']),
    number_days: Joi.number().required(),
    price_per_day: Joi.number().required(),
    contact_number: Joi.string().required(),
    discount: Joi.number().required(),
    comment: Joi.string().empty([null, '']),
    sum: Joi.number().required(),
    entry: Joi.string().required(),
    departure: Joi.string().required(),
})

const updateSchema = Joi.object({
    apartment_id: Joi.number(),
    customer_id: Joi.number(),
    passenger_id: Joi.number(),
    number_of_clients: Joi.number().min(1),
    prepayment: Joi.number(),
    services: Joi.string().allow(''),
    number_days: Joi.number(),
    price_per_day: Joi.number(),
    contact_number: Joi.string(),
    discount: Joi.number(),
    comment: Joi.string().allow(''),
    sum: Joi.number(),
    entry: Joi.string(),
    departure: Joi.string(),
})

app.post('/get', async (req, res, next) => {
    const { fromPeriod, endPeriod, customer } = req.body;

    const reservs = await apartmentsReservsModel.get({ fromPeriod, endPeriod, customer });

    // console.log('fromPeriod, endPeriod, customer');
    // console.log(fromPeriod, endPeriod, customer);

    // console.log('reservs', reservs);
    // console.log('----------------------------------------');

    return res.json({ status: 'ok', data: reservs });
})

app.post('/add', async (req, res, next) => {

    const { values } = req.body;
    const { id: manager_id } = req.session.user;

    Object.assign(values, { manager_id });

    const validValues = await addSchema.validate(values);

    const { apartment_id: apId } = validValues;

    const apInWorks = await db.execQuery(`
        SELECT id, entry, departure
        FROM apartment_reservations 
        WHERE 
            apartment_id = ${apId} 
            AND status NOT IN (0, 3)
            AND (
                ((entry BETWEEN '${validValues.entry}' AND '${validValues.departure}') OR (departure BETWEEN '${validValues.entry}' AND '${validValues.departure}'))
                OR (('${validValues.entry}' BETWEEN entry AND departure) AND ('${validValues.departure}' BETWEEN entry AND departure))
            )
    `);

    if (apInWorks.length > 0)
        throw new Error('Данная квартира уже находится в работе');

    const id = await db.insertQuery(`INSERT INTO apartment_reservations SET ?`, validValues);

    const [ar = {}] = await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
        WHERE ar.id = ?`, [id]
    );

    ar.statusName = apartments_statuses.get(1);
    ar.created_at = moment(ar.created_at).format('DD.MM.YYYY');

    res.json({ status: 'ok', data: ar });
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = await updateSchema.validate(fields);

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    if (new Date(validValues.entry) >= new Date(validValues.departure))
        throw new Error('Дата въезда не должна быть позднее даты выезда');


    if (validValues.apartment_id) {
        const apInWorks = await db.execQuery(`
            SELECT id, entry, departure
            FROM apartment_reservations 
            WHERE
                id <> ${id}
                AND apartment_id = ${validValues.apartment_id} 
                AND status NOT IN (0, 3)
                AND (
                    ((entry BETWEEN '${validValues.entry}' AND '${validValues.departure}') OR (departure BETWEEN '${validValues.entry}' AND '${validValues.departure}'))
                    OR (('${validValues.entry}' BETWEEN entry AND departure) AND ('${validValues.departure}' BETWEEN entry AND departure))
                )
        `);

        if (apInWorks.length > 0)
            throw new Error('В указанное время квартира забронирована');
    }

    await db.execQuery(`UPDATE apartment_reservations SET ? WHERE id = ?`, [validValues, id]);

    if (typeof validValues.status !== 'undefined') {
        validValues.status_name = apartments_statuses.get(+validValues.status);
    }

    const [item = {}] = await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name,
            c.name as customer_name,
            p.contact_number as client_number
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
            LEFT JOIN customers c ON ar.customer_id = c.id
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