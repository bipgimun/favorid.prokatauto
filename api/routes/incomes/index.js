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

module.exports = app;