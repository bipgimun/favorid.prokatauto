const express = require('express');
const app = express.Router();

const moment = require('moment');

const printFlowTable = require('../../../Service/printFlowTable');

const db = require('../../../libs/db');
const {
    costsCategories: costsCategoriesModel,
    drivers: driversModel,
    suppliersDealsModel,
    customersModel,
} = require('../../../models');

app.post('/getTable', async (req, res, next) => {

    const { time_min, time_max, unit } = req.body;

    const {
        balanceAtEndPeriod,
        balanceAtStartPeriod,
        costs,
        incomes,
    } = await calcData(time_min, time_max, unit);

    res.render('partials/units-profitability-table', {
        layout: false,
        incomes,
        costs,
        balanceAtStartPeriod,
        balanceAtEndPeriod
    }, (error, html) => {

        if (error)
            return res.json({ status: 'bad', body: error.message });

        res.json({
            status: 'ok',
            html
        });
    });
})

app.get('/print', async (req, res, next) => {
    const { time_min, time_max, unit } = req.query;

    const {
        balanceAtEndPeriod,
        balanceAtStartPeriod,
        costs,
        incomes,
    } = await calcData(timeMin, timeMax, cashStorageId);

    const operations = [...incomes, ...costs];

    const filepath = await printFlowTable({
        operations,
        balanceAtEndPeriod,
        balanceAtStartPeriod,
        timeMax: moment(timeMax).format('DD.MM.YYYY'),
        timeMin: moment(timeMin).format('DD.MM.YYYY')
    });

    res.download(filepath);
})


async function calcData(time_min, time_max, unit) {
    const balanceAtNow = 0;
    const balanceAtStartPeriod = 0;
    const balanceAtEndPeriod = 0;

    const [, typeOfUnit] = unit.match(/([\w\-]*)-\d*/);

    if(!['APR, CAR, CUST'].includes(typeOfUnit)) {
        throw new Error('Неверный тип объекта');
    }

    
}

module.exports = app;