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
    carsReservsModel,
    apartmentsReservsModel,
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

    const { period_left, period_right, customer_id } = await acceptSchema.validate(req.body);

    const {
        money,
        positions,
        moneyIncome,
        positionsGone,
        positionsIncome,
        totalSum,
        moneyGone } = await calcTable({ period_left, period_right, customer_id });

    const {
        totalSum: saldoSum } = await calcTable({
            period_right: moment(period_left).subtract(1, 'day').format('YYYY-MM-DD'),
            customer_id
        });

    const totalIncome = +moneyIncome + +positionsIncome;
    const totalGone = +moneyGone + +positionsGone;

    const total = saldoSum + totalIncome - totalGone;
    const saldoDate = moment(period_left).subtract(1, 'day').format('DD.MM.YYYY');

    res.render('partials/act-sverki-table.hbs', {
        layout: false,
        totalSum,
        saldoDate,
        total,
        positions,
        money,
        positionsGone,
        positionsIncome,
        moneyIncome,
        moneyGone,
        totalIncome,
        totalGone,
        saldoSum
    }, (error, html) => {
        if (error) return res.json({ status: 'bad', body: error.message });

        res.json({ status: 'ok', body: html, data: { positions, money, saldo: saldoSum, totalSum: total } });
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

async function calcTable({ period_left = '', period_right = '', customer_id = '', document = {} }) {

    const sqlFormat = 'YYYY-MM-DD HH:mm';

    const dateLt = moment(period_right).set({ hours: 23, minutes: 59 }).format(sqlFormat);
    const dateGt = period_left ? moment(period_left).set({ hours: 0, minute: 0 }).format(sqlFormat) : '';

    let carOptions = {
        statuses: '2',
        customer: customer_id,
        rentStartLt: dateLt,
        rentStartGt: dateGt,
    };

    let apartmentOptions = {
        statuses: '3',
        customer: customer_id,
        rentStartLt: dateLt,
        rentStartGt: dateGt,
    };

    const date = period_left
        ? `date BETWEEN '${dateGt}' AND '${dateLt}'`
        : `date <= '${dateLt}'`;

    let incomesQuery = `SELECT * FROM incomes WHERE ${date} AND customer_id = ${customer_id}`;

    if (Object.keys(document).length > 0) {

        const details = await db.execQuery(`
            SELECT * 
            FROM act_sverki_documents_details 
            WHERE document_id = ?`, [document.id]
        );

        const cars = details.filter(item => item.code === 'CRR')
            .map(item => item.base_id)
            .join(',');

        const apartments = details.filter(item => item.code === 'APR')
            .map(item => item.base_id)
            .join(',');

        const incomes = details.filter(item => item.income)
            .map(item => item.base_id)
            .join(',');

        // @ts-ignore
        carOptions = {
            ids: cars
        };

        // @ts-ignore
        apartmentOptions = {
            ids: apartments
        };

        incomesQuery = `SELECT * FROM incomes WHERE id IN (${incomes})`;
    }

    const carReservs = await carsReservsModel.get(carOptions);
    const apartmentReservs = await apartmentsReservsModel.get(apartmentOptions);

    const incomes = await db.execQuery(incomesQuery);

    const positions = [];
    const money = [];

    let positionsGone = 0;
    let positionsIncome = 0;

    let moneyGone = 0;
    let moneyIncome = 0;

    carReservs.forEach(reserv => {

        const { id, has_driver, rent_start, sum } = reserv;
        const date = moment(rent_start).format('DD.MM.YYYY');

        const title = `Заявка на аренду авто ${has_driver == '1' ? 'с водителем' : ''} №${id} от ${date}`;

        positionsGone += +sum;

        positions.push({
            id,
            code: 'CRR',
            title,
            income: '--',
            gone: sum,
        });
    })

    apartmentReservs.forEach(reserv => {

        const { entry, sum, id } = reserv;
        const date = moment(entry).format('DD.MM.YYYY');

        const title = `Заявка на аренду квартиры №${id} от ${date}`;

        positionsGone += +sum;

        positions.push({
            id,
            code: 'APR',
            title,
            income: '--',
            gone: sum,
        });
    })

    incomes.forEach(income => {

        const { id, date, sum } = income;

        moneyIncome += +sum;

        money.push({
            id,
            title: `Документ прихода №${id} от ${moment(date).format('DD.MM.YYYY')}`,
            income: sum,
            gone: '--'
        })
    })

    const totalSum = (+positionsIncome + +moneyIncome) - (+positionsGone + +moneyGone);

    return { money, positions, positionsGone, positionsIncome, period_left, period_right, moneyGone, moneyIncome, totalSum };
}

module.exports = router;