const router = require('express').Router();

const Joi = require('joi');

const acceptSchema = Joi.object({
    period_left: Joi.date().iso().required(),
    period_right: Joi.date().iso().required(),
    customer_id: Joi.number().required(),
});

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

router.get('/print', async function (req, res, next) {

    const { period_left, period_right, customer_id, id } = await printSchema.validate(req.query);

    const [customer] = await customersModel.get({ id: customer_id });

    if (!customer)
        throw new Error('Заказчик отсутствует');

    let positions;
    let money;
    let saldoSum;
    let saldoDate;

    moment.locale('ru');

    const [document = false] = id
        ? (await db.execQuery(`SELECT * FROM act_sverki_documents WHERE id = ?`, [id]))
        : [];

    if (document.id) {
        const details = await db.execQuery(`
            SELECT * 
            FROM act_sverki_documents_details 
            WHERE document_id = ?`, [document.id]
        );

        positions = details.filter(item => item.code === 'CRR' || item.code === 'APR');

        money = details.filter(item => item.income);

        saldoSum = document.saldo;
        saldoDate = moment(document.period_left).subtract(1, 'day').format('DD.MM.YYYY');
    } else {
        const calcResult = await calcTable({ period_left, period_right, customer_id });

        money = calcResult.money;
        positions = calcResult.positions;;

        const saldoResult = await calcTable({
            customer_id, period_right: moment(period_left).subtract(1, 'day').format('YYYY-MM-DD'),
        });

        saldoSum = saldoResult.totalSum;

        saldoDate = moment(period_left).subtract(1, 'day').format('DD.MM.YYYY');
    }

    const currentDate = moment(new Date()).format('DD MMMM YYYY');

    const dataArray = [...money, ...positions].map((item) => {
        const { title, income, gone } = item;
        return [title, income && income !== '--' ? income : '', gone && gone !== '--' ? gone : ''];
    });

    const file = await printAct({ customer, currentDate, saldoSum, dataArray, saldoDate, period_left: moment(period_left).format('DD.MM.YYYY'), period_right: moment(period_right).format('DD.MM.YYYY') });

    res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
        fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
    });
})

router.post('/document/save', async (req, res, next) => {
    const { money: incomes, positions, customer_id, period_left, period_right, sum, saldo } = req.body;

    if (!Array.isArray(incomes) || !Array.isArray(positions) || !customer_id) {
        throw new Error('Ошибка входных переменных');
    }

    const document_id = await db.insertQuery(`INSERT INTO act_sverki_documents SET ?`, {
        customer_id,
        period_left,
        period_right,
        sum,
        saldo,
        manager_id: req.session.user.employee_id,
    });

    try {
        for (const income of incomes) {
            const { id: base_id, income: sum, title } = income;
            await db.insertQuery(`INSERT INTO act_sverki_documents_details SET ?`, { document_id, base_id, income: sum, title });
        }

        for (const position of positions) {
            const { id: base_id, gone, code, title } = position;
            await db.insertQuery(`INSERT INTO act_sverki_documents_details SET ?`, { document_id, base_id, gone, code, title });
        }
    } catch (error) {
        await db.execQuery(`DELETE FROM act_sverki_documents WHERE id = ?`, [document_id]);
        throw new Error(error);
    }

    const [document] = await db.execQuery(`
        SELECT d.*, c.name as customer_name 
        FROM act_sverki_documents d 
            LEFT JOIN customers c ON d.customer_id = c.id 
        WHERE d.id = ?`, [document_id]);

    document.created = moment(document.created).format('DD.MM.YYYY');

    return res.json({ status: 'ok', data: document });
})

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

    const dealsIds = deals
        .map(deal => deal.id)
        .join(',');

    const costs = dealsIds
        ? await db.execQuery(`
            SELECT * 
            FROM costs 
            WHERE code = ? 
                AND document_id IN (${dealsIds})
                ${queryGt}
                AND date <= '${dateLt.format(sqlFormat)}'
        `, ['SD'])
        : [];

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