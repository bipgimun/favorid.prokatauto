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

    const [, typeOfUnit, unitValue] = unit.match(/([\w\-]*)-(\d*)/);

    if (!['APR', 'CAR', 'CUST', 'MUZ'].includes(typeOfUnit)) {
        throw new Error('Неверный тип объекта');
    }

    const calcFunction = getCalcFunction({ unit: typeOfUnit, unitValue, time_max, time_min });

    calcFunction();

    return {};
}

const getCalcFunction = ({ unit, unitValue, time_max, time_min }) => {

    const dateGt = moment(time_min).set({ h: 0, m: 0 }).format('YYYY-MM-DD');
    const dateLt = moment(time_max).set({ h: 23, m: 59 }).format('YYYY-MM-DD');
    
    const calcByUnit = {

        'CAR': async function calcByCar() {

            const costs = await db.execQuery(`
                SELECT c.*,
                    cd.price as sum
                FROM costs c
                    LEFT JOIN costs_details cd ON cd.cost_id = c.id
                WHERE cd.target_type = ?
                    AND cd.target_id = ?
                    AND c.date BETWEEN '${dateGt}' AND '${dateLt}'
                `, ['auto', unitValue]
            );

            // заявки с выбранным авто
            const reservsByCar = await db.execQuery(`SELECT * FROM cars_reservations WHERE car_id = ?`, [unitValue]);
            
            // айди заявок, в которых присутствует авто
            const reservsIds = reservsByCar.map(item => item.id).join(',');
            
            // выбор приходников по заявкам на аренду выбранного авто
            const incomesByReserv = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.date BETWEEN '${dateGt}' AND '${dateLt}'
                    AND i.code = 'CRR'
                    AND i.document_id IN (?)
                `, [reservsIds]
            );
            
            const invoices = await db.execQuery(`
                SELECT *
                FROM invoices
                WHERE code = 'CRR'
                    AND base_id IN (?)
                `, [reservsIds]
            );


            // выбор приходов по счетам по аренде авто
            const incomesByInvoice = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.date BETWEEN '${dateGt}' AND '${dateLt}'
                    AND i.code = 'pd'
                    AND i.document_id in(?)
                `, [invoicesId]
            );
            
        },

        'APR': ({ unitValue, time_max, time_min }) => {
            console.log('apr');

        },

        'CUST': ({ unitValue, time_max, time_min }) => {
            console.log('cust');

        },
        'MUZ': ({ unitValue, time_max, time_min }) => {
            console.log('muz');

        },
    };

    return calcByUnit[unit];
}


module.exports = app;