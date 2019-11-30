const {
    carsReservsModel,
    apartmentsReservsModel
} = require('../../../models');

const router = require('express').Router();
const db = require('../../../libs/db');

const moment = require('moment');

router.post('/getTable', async (req, res, next) => {

    const { period_left, period_right, driver_id } = req.body;

    const {
        money,
        positions,
        positionsCosts,
        positionsIncome,
        moneyCosts,
        moneyIncome,
        totalSum
    } = await calcTable({ period_left, period_right, driver_id });

    const {
        totalSum: saldoSum
    } = await calcTable({
        period_right: moment(period_left).subtract(1, 'day').format('YYYY-MM-DD'),
        driver_id
    });

    const totalIncome = +moneyIncome + +positionsIncome;
    const totalCosts = +moneyCosts + +positionsCosts;

    const total = saldoSum + totalIncome - totalCosts;
    const saldoDate = moment(period_left).subtract(1, 'day').format('DD.MM.YYYY');

    res.render('partials/driver-balance.hbs', {
        layout: false,
        totalSum,
        saldoDate,
        total,
        positions,
        money,
        positionsCosts,
        positionsIncome,
        moneyIncome,
        moneyCosts,
        totalIncome,
        totalCosts,
        saldoSum
    }, (error, html) => {
        if (error) return res.json({ status: 'bad', body: error.message });

        res.json({ status: 'ok', html, data: { positions, money, saldo: saldoSum, totalSum: total } });
    });
})


async function calcTable({ period_left = '', period_right = '', driver_id = '' }) {

    const sqlFormat = 'YYYY-MM-DD HH:mm';

    const dateLt = moment(period_right).set({ hours: 23, minutes: 59 }).format(sqlFormat);
    const dateGt = period_left ? moment(period_left).set({ hours: 0, minute: 0 }).format(sqlFormat) : '';

    let carOptions = {
        statuses: '2',
        driver_id: driver_id,
        rentStartLt: dateLt,
        rentStartGt: dateGt,
    };

    const date = period_left
        ? `date BETWEEN '${dateGt}' AND '${dateLt}'`
        : `date <= '${dateLt}'`;

    const costs = await db.execQuery(`SELECT * FROM costs WHERE ${date} AND driver_id = ${driver_id}`);

    const carReservs = await carsReservsModel.get(carOptions);

    const shifts = await db.execQuery(`
        SELECT d2s.*,
            s2c.contract_id,
            s2c.date_start as shift_start
        FROM drivers2shifts d2s
            LEFT JOIN shifts2contracts s2c ON d2s.shift_id = s2c.id
        WHERE d2s.driver_id = ${driver_id}
            AND s2c.is_completed = 1
            AND ${period_left ? `s2c.date_start BETWEEN '${dateGt}' AND '${dateLt}'` : `s2c.date_start <= '${dateLt}'`}
    `);

    const positions = [];
    const money = [];

    let positionsCosts = 0;
    let positionsIncome = 0;

    let moneyCosts = 0;
    let moneyIncome = 0;

    carReservs.forEach(reserv => {

        const { id, has_driver, rent_start, sum } = reserv;
        const date = moment(rent_start).format('DD.MM.YYYY');

        const title = `Заявка на аренду авто ${has_driver == '1' ? 'с водителем' : ''} №${id} от ${date}`;

        positionsIncome += +sum;

        positions.push({
            id,
            code: 'CRR',
            title,
            income: sum,
            gone: '--',
        });
    })

    shifts.forEach(shift => {

        const { id, value, hours, contract_id, shift_start } = shift;

        const date = moment(shift_start).format('DD.MM.YYYY');
        const title = `Поездка по контракту №${contract_id} от ${date}`;

        const sum = value * hours;

        positionsIncome += +sum;

        positions.push({
            id,
            code: 'MUZ',
            title,
            income: sum,
            gone: '--',
        });
    })

    costs.forEach(income => {

        const { id, date, sum } = income;

        moneyCosts += +sum;

        money.push({
            id,
            title: `Документ расхода №${id} от ${moment(date).format('DD.MM.YYYY')}`,
            income: '--',
            gone: sum
        })
    })

    const totalSum = (+positionsIncome + +moneyIncome) - (+positionsCosts + +moneyCosts);

    return {
        money,
        positions,
        positionsCosts,
        positionsIncome,
        period_left,
        period_right,
        moneyCosts,
        moneyIncome,
        totalSum,
    };
}

module.exports = router;