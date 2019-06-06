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
} = require('../../../models')

const printSchema = Joi.object({
    period_left: Joi.date().iso(),
    period_right: Joi.date().iso(),
    customer_id: Joi.number(),
    detail_id: Joi.number().default(null)
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

        res.json({ status: 'ok', body: html });
    });
});

router.get('/print', async function (req, res, next) {
    const data = await printSchema.validate(req.query);

    const file = await printAct();

    res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
        fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
    });
})

async function calcTable({ period_left = '', period_right, customer_id }) {

    const sqlFormat = 'YYYY-MM-DD HH:mm';

    const dateLt = moment(period_right).set({ hours: 23, minutes: 59 }).format(sqlFormat);
    const dateGt = period_left ? moment(period_left).set({ hours: 0, minute: 0 }).format(sqlFormat) : '';

    const carReservs = await carsReservsModel.get({
        statuses: '2',
        customer: customer_id,
        rentStartLt: dateLt,
        rentStartGt: dateGt,
    });

    const apartmentReservs = await apartmentsReservsModel.get({
        statuses: '3',
        customer: customer_id,
        rentStartLt: dateLt,
        rentStartGt: dateGt,
    });

    const date = period_left
        ? `date BETWEEN '${dateGt}' AND '${dateLt}'`
        : `date <= '${dateLt}'`;

    const incomes = await db.execQuery(`SELECT * FROM incomes WHERE ${date}`);

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
            title,
            income: '--',
            gone: sum,
        });
    })

    incomes.forEach(income => {

        const { id, date, sum } = income;

        moneyIncome += +sum;

        money.push({
            title: `Документ прихода №${id} от ${moment(date).format('DD.MM.YYYY')}`,
            income: sum,
            gone: '--'
        })
    })

    const totalSum = (+positionsIncome + +moneyIncome) - (+positionsGone + +moneyGone);

    return { money, positions, positionsGone, positionsIncome, period_left, period_right, moneyGone, moneyIncome, totalSum };
}

module.exports = router;