const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');

const Joi = require('joi');
const moment = require('moment');

const addScheme = Joi.object({
    date: Joi.date().iso().required(),
    base_id: Joi.string(),
    base_other: Joi.string(),
    sum: Joi.number().required(),
    cash_storage_id: Joi.number().integer().required(),
    comment: Joi.string().allow('')
}).xor('base_id', 'base_other');

const updateScheme = Joi.object({
    date: Joi.date().iso().empty([null, '']),
    cash_storage_id: Joi.number().integer().empty([null, '']),
    sum: Joi.number().empty([null, '']),
    comment: Joi.string().allow(''),
    id: Joi.number().required()
}).or('date', 'cash_storage_id', 'sum', 'comment');

app.post('/add', async (req, res, next) => {

    const { values } = req.body;

    const validValues = await Joi.validate(values, addScheme);

    if (validValues.base_id) {
        const [, code = ''] = /([\w]+)-[\d]+/.exec(validValues.base_id) || [];

        validValues.code = code;
    }

    const id = await db.insertQuery('INSERT INTO incomes SET ?', [validValues]);

    validValues.id = id;
    validValues.base = validValues.base_id || validValues.base_other;
    validValues.date = moment(validValues.date).format('DD.MM.YYYY');

    res.json({
        status: 'ok', data: validValues
    });
})

app.post('/update', async (req, res, next) => {

    const { values } = req.body;

    const { id, ...validValues } = await Joi.validate(values, updateScheme);

    await db.insertQuery('UPDATE incomes SET ? WHERE id = ?', [validValues, id]);

    const [income = {}] = await db.execQuery(`
       SELECT i.*,
            cs.name as cashbox_name
        FROM incomes i
            LEFT JOIN cash_storages cs ON cs.id = i.cash_storage_id 
        WHERE i.id = ?
    `, [id]);

    const returnValues = { validValues, ...income };

    returnValues.date = moment(returnValues.date).format('DD.MM.YYYY');

    res.json({
        status: 'ok', data: returnValues
    });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('Отсутствует номер прихода');

    await db.execQuery('DELETE FROM incomes WHERE id = ?', [id]);

    res.json({
        status: 'ok',
    });
})

module.exports = app;