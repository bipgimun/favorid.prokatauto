const {
    carsReservsModel,
    
} = require('../../../models');

const router = require('express').Router();
const db = require('../../../libs/db');

const moment = require('moment');

router.post('/getTable', async (req, res, next) => {

    const { driver, periodLeft, periodRight } = req.body;

    if (!driver || !periodLeft || !periodRight) {
        throw new Error('Ошибка входных данных: отсутствуют обязательные параметры');
    }

    await db.execQuery(`
        SELECT * 
        FROM balance 
        WHERE id = ?
    `, [driver]);

    res.render('partials/balance-table.hbs', {
        layout: false,
    }, (error, html) => {
        if (error) return res.json({ status: 'bad', body: error.message });

        res.json({
            status: 'ok', html, data: {
                driver_name,
                costs,
                income,
                total_sum,
            }
        });
    });
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