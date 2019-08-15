const router = require('express').Router();

const Joi = require('joi');

const db = require('../../../libs/db');
const moment = require('moment');

const {
    customersModel,
} = require('../../../models')

const printSchema = Joi.object({
    period_left: Joi.date().iso(),
    period_right: Joi.date().iso(),
    customer_id: Joi.number(),
    detail_id: Joi.number().default(null),
    id: Joi.number().default(null),
})

const printAct = require('../../../libs/act-sverki-print');

const path = require('path');
const fs = require('fs');

router.post('/getTable', async (req, res, next) => {

    const {
        period_left,
        period_right,
        supplier_id
    } = req.body;

    const {
        costsDetails: periodCostsDetails,
        dealsDetails: periodDealsDetails,
        totalSum: periodTotalSum
    } = await calcTable({ period_left, period_right, supplier_id });

    const {
        totalSum: saldoSum
    } = await calcTable({ period_right: moment(period_left).subtract(1, 'day').format('YYYY-MM-DD'), supplier_id });

    res.render('partials/act-sverki-suppliers-table.hbs', {
        layout: false,
        periodCostsDetails,
        periodDealsDetails,
        saldoSum,
        saldoDate: moment(period_left).subtract(1, 'day').format('DD.MM.YYYY'),
        totalSum: saldoSum + periodTotalSum
    }, (error, html) => {
        if (error) return res.json({ status: 'bad', body: error.message });

        res.json({
            status: 'ok',
            body: html,
        });
    });
});

async function calcTable({ period_left = '', period_right = '', supplier_id = '', document = {} }) {

    const sqlFormat = `YYYY-MM-DD HH:mm`

    const dateGt = moment(period_left).hour(0).minute(0);
    const dateLt = moment(period_right).hours(23).minute(59);

    const queryDealsGt = period_left
        ? `AND sd.date >= '${dateGt.format(sqlFormat)}'`
        : '';

    const queryGt = period_left
        ? `AND date >= '${dateGt.format(sqlFormat)}'`
        : '';

    const deals = await db.execQuery(`
        SELECT sd.*,
            s.name as supplier_name 
        FROM suppliers_deals sd
            LEFT JOIN suppliers s ON s.id = sd.supplier_id
        WHERE sd.supplier_id = ${supplier_id}
            AND sd.date <= '${dateLt.format(sqlFormat)}'
            ${queryDealsGt}
    `);

    const costs = await db.execQuery(`
        SELECT * 
        FROM costs 
        WHERE code = 'SD'
            AND document_id IN (
                SELECT suppliers_deals.id
                FROM suppliers_deals
                WHERE suppliers_deals.supplier_id = ${supplier_id}
            )
            AND date <= '${dateLt.format(sqlFormat)}'
            ${queryGt}
    `);

    const dealsDetails = {
        sum: 0,
        deals: []
    };

    const costsDetails = {
        sum: 0,
        costs: []
    };

    for (const deal of deals) {
        dealsDetails.sum += +deal.sum;

        dealsDetails.deals.push({
            title: `Сделка № ${deal.id} от ${moment(deal.date).format('DD.MM.YYYY')}`,
            sum: +deal.sum
        });
    }

    for (const cost of costs) {
        costsDetails.sum += +cost.sum;

        costsDetails.costs.push({
            title: `Документ расхода № ${cost.id} от ${moment(cost.date).format('DD.MM.YYYY')}`,
            sum: +cost.sum
        });
    }

    return { costsDetails, dealsDetails, totalSum: dealsDetails.sum - costsDetails.sum };
}

module.exports = router;