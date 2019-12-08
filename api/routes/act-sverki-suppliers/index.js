const router = require('express').Router();
const moment = require('moment');
const path = require('path')
const Joi = require('joi');
const fs = require('fs');

const db = require('../../../libs/db');

const printSchema = Joi.object({
    period_left: Joi.date().iso(),
    period_right: Joi.date().iso(),
    supplier_id: Joi.number(),
    detail_id: Joi.number().default(null),
    id: Joi.number().default(null),
})

const printAct = require('../../../libs/act-sverki-suppliers-print');
const {

} = require('../../../models');


router.post('/getTable', async (req, res, next) => {

    const {
        period_left,
        period_right,
        supplier_id
    } = req.body;

    const periodData = await calcTable({ period_left, period_right, supplier_id });

    const {
        costsDetails: periodCostsDetails,
        dealsDetails: periodDealsDetails,
        totalSum: periodTotalSum
    } = periodData;

    const saldoT = await calcTable({ period_right: moment(period_left).subtract(1, 'day').format('YYYY-MM-DD'), supplier_id });

    const { totalSum: saldoSum } = saldoT;

    const totalSumWithSaldo = +saldoSum + +periodTotalSum;

    res.render('partials/act-sverki-suppliers-table.hbs', {
        layout: false,
        periodCostsDetails,
        periodDealsDetails,
        saldoSum,
        saldoDate: moment(period_left).subtract(1, 'day').format('DD.MM.YYYY'),
        totalSum: totalSumWithSaldo
    }, (error, html) => {
        if (error) return res.json({ status: 'bad', body: error.message });

        res.json({
            status: 'ok',
            body: html,
            data: {
                totalSumWithSaldo,
                money: periodCostsDetails.costs,
                deals: periodDealsDetails.deals,
                saldo: saldoSum
            }
        });
    });
});

router.get('/print', async function (req, res, next) {

    moment.locale('ru');

    const { period_left, period_right, supplier_id } = await printSchema.validate(req.query);

    const [supplier] = await db.execQuery(`
        SELECT * 
        FROM suppliers 
        WHERE id > 0 
            ${supplier_id ? `AND id = ${supplier_id}` : ''}
    `);

    if (!supplier)
        throw new Error('Заказчик отсутствует');

    const currentDate = moment(new Date()).format('DD MMMM YYYY');
    const periodData = await calcTable({ period_left, period_right, supplier_id });

    const {
        costsDetails,
        dealsDetails,
        totalSum: periodSum
    } = periodData;

    const { sum: costsSum, costs } = costsDetails;
    const { sum: incomeSum, deals } = dealsDetails;

    const saldoDateNotFormat = moment(period_left).subtract(1, 'day');

    const saldoResult = await calcTable({
        supplier_id,
        period_right: saldoDateNotFormat.format('YYYY-MM-DD'),
    });

    const { totalSum: saldoSum } = saldoResult;
    const saldoDate = saldoDateNotFormat.format('DD.MM.YYYY');

    const dataArray = [...costs, ...deals].map((item) => {
        const { title, sum, code } = item;

        const data = code
            ? [sum, '']
            : ['', sum];

        return [
            title,
            ...data
        ];
    });

    const file = await printAct({
        supplier,
        currentDate,
        saldoSum,
        dataArray,
        saldoDate,
        sumOnPeriodEnd: saldoSum + incomeSum - costsSum,
        period_left: moment(period_left).format('DD.MM.YYYY'),
        period_right: moment(period_right).format('DD.MM.YYYY')
    });

    res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
        fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
    });
})


router.post('/document/save', async (req, res, next) => {

    const {
        money = [],
        deals = [],
        saldo,
        totalSum,
        period_left,
        period_right,
        supplier_id,
    } = req.body;

    if (!Array.isArray(money) || !Array.isArray(deals) || !supplier_id) {
        throw new Error('Ошибка входных переменных');
    }

    const document_id = await db.insertQuery(`INSERT INTO act_sverki_suppliers_documents SET ?`, {
        supplier_id,
        period_left,
        period_right,
        sum: totalSum,
        saldo,
        manager_id: req.session.user.employee_id,
    });

    try {
        for (const cost of money) {

            const { id: base_id, sum, title } = cost;

            await db.insertQuery(`INSERT INTO act_sverki_suppliers_documents_details SET ?`, {
                document_id,
                base_id,
                gone: sum,
                title
            });
        }

        for (const deal of deals) {
            const { id: base_id, sum, code, title } = deal;

            await db.insertQuery(`INSERT INTO act_sverki_suppliers_documents_details SET ?`, {
                document_id,
                base_id,
                income: sum,
                code,
                title
            });
        }
    } catch (error) {
        await db.execQuery(`DELETE FROM act_sverki_suppliers_documents WHERE id = ?`, [document_id]);
        throw new Error(error);
    }


    const [actSverkiSupplier] = await db.execQuery(`
         SELECT d.*,
            s.name as supplier_name
        FROM act_sverki_suppliers_documents d
            LEFT JOIN suppliers s ON s.id = d.supplier_id
        WHERE d.id = ${document_id}
    `);

    actSverkiSupplier.created_at = moment(actSverkiSupplier.created_at).format('DD.MM.YYYY');

    return res.json({ status: 'ok', data: actSverkiSupplier });
})

async function calcTable({ period_left = '', period_right = '', supplier_id = '' }) {
    if (!supplier_id) {
        throw new Error('Не выбран заказчик');
    }

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
            AND (document_id IN (
                SELECT suppliers_deals.id
                FROM suppliers_deals
                WHERE suppliers_deals.supplier_id = ${supplier_id}
            )
            OR supplier_id = ${supplier_id})
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
            code: 'SD',
            sum: +deal.sum,
            id: deal.id
        });
    }

    for (const cost of costs) {

        costsDetails.sum += +cost.sum;

        costsDetails.costs.push({
            title: `Документ расхода № ${cost.id} от ${moment(cost.date).format('DD.MM.YYYY')}`,
            sum: +cost.sum,
            id: cost.id
        });
    }

    return { costsDetails, dealsDetails, totalSum: dealsDetails.sum - costsDetails.sum };
}

module.exports = router;