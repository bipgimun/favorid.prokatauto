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

    const { timeMin, timeMax, cashStorageId } = req.body;

    const {
        balanceAtEndPeriod,
        balanceAtStartPeriod,
        costs,
        incomes,
    } = await calcDDS(timeMin, timeMax, cashStorageId);

    res.render('partials/flow-founds-table', {
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
            body: html,
        });
    });
})

app.get('/print', async (req, res, next) => {
    const { timeMin, timeMax, cashStorageId } = req.query;

    const {
        balanceAtEndPeriod,
        balanceAtStartPeriod,
        costs,
        incomes,
    } = await calcDDS(timeMin, timeMax, cashStorageId);

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


async function calcDDS(timeMin, timeMax, cashStorageId) {

    const timeMinSql = moment(timeMin).hours(0).minutes(0).format('YYYY-MM-DD');
    const timeMaxSql = moment(timeMax).hours(23).minutes(59).format('YYYY-MM-DD');

    const incomesInPeriod = await db.execQuery(`
        SELECT i.*,
            cs.name as cashStorageName,
            c.name as customer_name,
            c.name as sourceDir,
            i.sum as income_sum
        FROM incomes i
            LEFT JOIN cash_storages cs ON cs.id = i.cash_storage_id
            LEFT JOIN customers c ON c.id = i.customer_id
        WHERE ${cashStorageId ? `cash_storage_id = ${cashStorageId} ` : '1'}
            AND date BETWEEN ? AND ?`,
        [timeMinSql, timeMaxSql]
    );

    const costsInPeriod = await getCosts(cashStorageId, timeMinSql, timeMaxSql);

    const incomesBeforePeriod = await db.execQuery(`SELECT * FROM incomes WHERE ${cashStorageId ? `cash_storage_id = ${cashStorageId} ` : '1'} AND date < ?`, [timeMinSql]);
    const costsBeforePeriod = await db.execQuery(`SELECT * FROM costs WHERE ${cashStorageId ? `cash_storage_id = ${cashStorageId} ` : '1'} AND date < ?`, [timeMinSql]);

    const incomeAtStartPeriod = incomesBeforePeriod.reduce((acc, item) => {
        return acc + +item.sum;
    }, 0);

    const costsAtStartPeriod = costsBeforePeriod.reduce((acc, item) => {
        return acc + +item.sum;
    }, 0);

    const incomeInPeriod = incomesInPeriod.reduce((acc, item) => {
        return acc + +item.sum;
    }, 0);

    const costInPeriod = costsInPeriod.reduce((acc, item) => {
        return acc + +item.sum;
    }, 0);

    const balanceAtStartPeriod = incomeAtStartPeriod - costsAtStartPeriod;
    const balanceAtEndPeriod = balanceAtStartPeriod + (incomeInPeriod - costInPeriod);


    return {
        balanceAtStartPeriod,
        balanceAtEndPeriod,
        incomes: incomesInPeriod,
        costs: costsInPeriod
    };
}

async function getCosts(cashStorageId, timeMinSql, timeMaxSql) {
    const costs = await db.execQuery(`
        SELECT c.*,
            cs.name as cashStorageName,
            c.sum as cost_sum
        FROM costs c
            LEFT JOIN cash_storages cs ON cs.id = c.cash_storage_id
        WHERE ${cashStorageId ? `cash_storage_id = ${cashStorageId} ` : '1'} 
            AND date BETWEEN ? AND ?`,
        [timeMinSql, timeMaxSql]
    );

    for (const cost of costs) {

        const { code, document_id: documentId } = cost;

        let toCost = '';

        if (code === 'CRR') {
            const [CRR] = await db.execQuery(`SELECT * FROM cars_reservations WHERE id = ?`, [documentId]);

            if (!CRR)
                continue;

            const [customer] = await customersModel.get({ id: CRR.customer_id });

            if (!customer)
                continue;

            toCost = customer.name;
        } else if (code === 'APR') {
            const [APR] = await db.execQuery(`SELECT * FROM apartment_reservations WHERE id = ?`, [documentId]);

            if (!APR)
                continue;

            const [customer] = await customersModel.get({ id: APR.customer_id });

            if (!customer)
                continue;

            toCost = customer.name;
        } else if (code === 'MUZ') {
            const [MUZ] = await db.execQuery(`SELECT * FROM muz_contracts WHERE id = ?`, [documentId]);

            if (!MUZ)
                continue;

            const [customer] = await customersModel.get({ id: MUZ.customer_id });

            if (!customer)
                continue;

            toCost = customer.name;
        } else if (code === 'CAR') {
            const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [documentId]);

            if (!car)
                continue;

            toCost = `${car.name} ${car.model} - ${car.number}`;
        } else if (code === 'SD') {
            const [supplierDeal] = await db.execQuery(`SELECT * FROM suppliers_deals WHERE id = ?`, [documentId]);

            if (!supplierDeal)
                continue;

            const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [documentId]);

            if (!supplier)
                continue;

            toCost = supplier.name;
        }


        if (cost.supplier_id) {
            const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [cost.supplier_id]);

            if (!supplier)
                continue;

            toCost = supplier.name;
        }

        if (cost.driver_id) {
            const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [cost.driver_id]);

            if (!driver)
                continue;

            toCost = driver.name;
        }

        cost.toCost = toCost;
        cost.sourceDir = toCost;
    }

    return costs;
}

module.exports = app;