const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');

const Joi = require('joi');
const moment = require('moment');

const addScheme = Joi.object({
    date: Joi.date().iso().required(),
    base_id: Joi.string(),
    base_other: Joi.string(),
    sum: Joi.number().required(),
    cash_storage_id: Joi.number().integer().required(),
    customer_id: Joi.number(),
    comment: Joi.string().allow('')
}).xor('base_id', 'base_other');

const updateScheme = Joi.object({
    date: Joi.date().iso().empty([null, '']),
    cash_storage_id: Joi.number().integer().empty([null, '']),
    sum: Joi.number().empty([null, '']),
    comment: Joi.string().allow(''),
    customer_id: Joi.number(),
    id: Joi.number().required()
}).or('date', 'cash_storage_id', 'sum', 'comment');

const {
    invoicesModel,
} = require('../../../models');

app.post('/add', async (req, res, next) => {

    const { values } = req.body;

    const validValues = await Joi.validate(values, addScheme);

    const { base_id: baseId } = validValues;

    if (baseId) {
        if (/([\w]+)-([\d]+)$/i.test(baseId)) {
            const [, code = '', document_id = ''] = /([\w]+)-([\d]+)$/i.exec(validValues.base_id) || [];

            validValues.code = code;
            validValues.document_id = document_id;
        } else if (/([\w]+-[\w]+)-([\d]+)$/i.test(baseId)) {
            const [, code = '', document_id = ''] = /([\w]+-[\w]+)-([\d]+)$/i.exec(validValues.base_id) || [];

            validValues.code = code;
            validValues.document_id = document_id;
        } else if (/(\w{1,2})-([\d]+)$/i.test(baseId)) {
            const [, code = '', document_id = ''] = /(\w{1,2})-([\d]+)$/i.exec(validValues.base_id) || [];

            validValues.code = code;
            validValues.document_id = document_id;
        } else {
            throw new Error('Неверный код основания');
        }
    }

    const id = await db.insertQuery('INSERT INTO incomes SET ?', validValues);

    const invoicePayments = await db.execQuery(`SELECT * FROM incomes WHERE code = ? AND document_id = ?`, ['pd', validValues.document_id]);

    if (baseId && validValues.code === 'pd') {
        const [invoice = {}] = await invoicesModel.get({ id: validValues.document_id });

        const invoicePaymentsSum = invoicePayments
            .map(item => item.sum)
            .reduce((acc, sum) => +acc + +sum, 0);

        if (invoicePaymentsSum >= +invoice.sum) {
            await invoicesModel.update({ id: validValues.document_id, closed: new Date() });
        }
    }

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

    const [removedIncome = {}] = await db.execQuery(`SELECT * FROM incomes WHERE id = ?`, [id]);

    if (!removedIncome.id)
        throw new Error('Запись не найдена');

    const { code, document_id } = removedIncome;

    if (code === 'pd') {

        const invoicePayments = await db.execQuery(`SELECT * FROM incomes WHERE code = ? AND document_id = ?`, [code, document_id]);
        const invoicePaymentsSum = invoicePayments
            .map(item => +item.sum)
            .reduce((acc, sum) => +acc + +sum, 0);

        const newPaymentSum = invoicePaymentsSum - removedIncome.sum;

        if (newPaymentSum < removedIncome.sum) {
            await invoicesModel.update({ id: document_id, closed: null });
        }
    }

    await db.execQuery('DELETE FROM incomes WHERE id = ?', [id]);

    res.json({
        status: 'ok',
    });
})

module.exports = app;