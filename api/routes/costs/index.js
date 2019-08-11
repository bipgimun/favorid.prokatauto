const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');

const Joi = require('joi');
const moment = require('moment');

const addScheme = Joi.object({
    base_id: Joi.string().empty(''),
    driver_id: Joi.string().empty(''),
    base_other: Joi.string().empty(''),
    sum: Joi.number().required(),
    cash_storage_id: Joi.number().integer().required(),
    category_id: Joi.number().integer().required(),
    comment: Joi.string().empty(''),
    date: Joi.date().iso().required(),
}).xor('base_id', 'base_other', 'driver_id');

const updateScheme = Joi.object({
    date: Joi.date().iso().empty([null, '']),
    category_id: Joi.number().integer().empty([null, '']),
    cash_storage_id: Joi.number().integer().empty([null, '']),
    sum: Joi.number().empty([null, '']),
    comment: Joi.string().allow(''),
    id: Joi.number().required()
}).or('date', 'cash_storage_id', 'sum', 'comment');

const { costsCategories: costsCategoriesModel } = require('../../../models');

app.post('/add', async (req, res, next) => {

    const { values } = req.body;

    const validValues = await Joi.validate(values, addScheme);

    if (validValues.base_id) {
        const [, code = '', document_id = ''] = /([\w]+)-([\d]+)/.exec(validValues.base_id) || [];

        validValues.code = code;
        validValues.document_id = document_id;
    }

    const id = await db.insertQuery('INSERT INTO costs SET ?', [validValues]);

    validValues.id = id;
    validValues.base = validValues.base_id || validValues.base_other;
    validValues.date = moment(validValues.date).format('DD.MM.YYYY');
    validValues.category = (await costsCategoriesModel.get({ id: validValues.category_id }))
        .reduce((acc, item) => item.title, '');

    res.json({
        status: 'ok', data: validValues
    });
})

app.post('/update', async (req, res, next) => {

    const { values } = req.body;

    const { id, ...validValues } = await Joi.validate(values, updateScheme);

    await db.insertQuery('UPDATE costs SET ? WHERE id = ?', [validValues, id]);

    const [cost = {}] = await db.execQuery(`
        SELECT c.*,
            cc.title as category,
            cs.name as cashbox_name
        FROM costs c
            LEFT JOIN costs_categories cc ON cc.id = c.category_id
            JOIN cash_storages cs ON cs.id = c.cash_storage_id
        WHERE c.id = ?
    `, [id]);

    const returnValues = { validValues, ...cost };

    returnValues.date = moment(returnValues.date).format('DD.MM.YYYY');

    res.json({
        status: 'ok', data: returnValues
    });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('Отсутствует номер расхода');

    await db.execQuery('DELETE FROM costs WHERE id = ?', [id]);

    res.json({
        status: 'ok',
    });
})

module.exports = app;