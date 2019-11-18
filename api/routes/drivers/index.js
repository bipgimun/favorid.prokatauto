const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');
const moment = require('moment');

const Joi = require('joi');

const addSchema = Joi.object({
    name: Joi.string().required(),
    birthday: Joi.date().iso().required(),
    contact_number: Joi.string().required(),
    driver_license: Joi.string().required(),
    license_date_issue: Joi.string().required(),
    license_date_expiration: Joi.string().required(),
    passport: Joi.string().required(),
    passport_date_issue: Joi.date().iso().required(),
    passport_issued_by: Joi.string().required(),
    passport_division_code: Joi.string().required(),
    passport_location: Joi.string().required(),
    car_id: Joi.number().empty([null, '']).optional(),
    is_individual: Joi.number().empty(''),
}).with('is_individual', 'car_id');

const updateSchema = Joi.object({
    name: Joi.string(),
    birthday: Joi.date().iso(),
    contact_number: Joi.string(),
    driver_license: Joi.string(),
    license_date_issue: Joi.string(),
    license_date_expiration: Joi.string(),
    passport: Joi.string(),
    passport_date_issue: Joi.date().iso(),
    passport_issued_by: Joi.string(),
    passport_division_code: Joi.string(),
    passport_location: Joi.string(),
    car_id: Joi.number()
        .empty('')
        .when('is_individual', {
            is: Joi.number().valid([1, 0]),
            then: Joi.required(),
            otherwise: Joi.any().default(null)
        }),
    is_individual: Joi.number()
        .valid([1, 0])
        .allow('')
        .empty('')
        .default(null),
})

const { drivers: driversModel } = require('../../../models');

app.post('/get', async (req, res, next) => {

    const drivers = await driversModel.get();

    return res.json({ status: 'ok', data: drivers })
})

app.get('/select2', async (req, res, next) => {
    const { search = '' } = req.query;
    const drivers = await driversModel.get({ search: safeStr(search) });

    return res.json({ items: drivers })
})

app.post('/get/:id', async (req, res, next) => {

    const { id } = req.params;

    if (!id)
        throw new Error('Отсутствует id');

    if (!Number(id))
        throw new Error('Неверно указан id');

    const [driver = {}] = await driversModel.get({ id });

    return res.json({ status: 'ok', data: driver })
})

app.post('/add', async (req, res, next) => {
    try {

        const { values } = req.body;
        const validValues = await addSchema.validate(values);

        const [similarDriver] = await db.execQuery(`SELECT * FROM drivers WHERE passport = ?`, [validValues.passport]);

        if (similarDriver) {
            throw new Error('Водитель с таким паспортом уже присутствует в справочнике');
        }

        const id = await db.insertQuery(`INSERT INTO drivers SET ?`, validValues);

        validValues.id = id;

        res.json({ status: 'ok', data: validValues });
    } catch (error) {

        throw new Error(error);
    }
})

app.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = await updateSchema.validate(fields);

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