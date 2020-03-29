const moment = require('moment');
const db = require('../db');

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const { carsReservsModel } = require('../../models');

module.exports = async ({ driver_id, leftDate, rightDate }) => {

    if (!leftDate || !rightDate) {
        return { total: 0, details: [] };
    }

    const sideLeftDate = moment(leftDate).add(-1, 'd').hours(23).minutes(59).seconds(59).format(DATE_FORMAT);
    const sideRightDate = moment(rightDate).hour(23).minute(59).second(59).format(DATE_FORMAT);

    const carReservs = await carsReservsModel.get({
        driver_id,
        fromPeriod: sideLeftDate,
        endPeriod: sideRightDate,
        statuses: '2'
    });

    const shifts = await db.execQuery(`
        SELECT d2s.*,
            s2c.contract_id,
            s2c.date_start as shift_start
        FROM drivers2shifts d2s
            LEFT JOIN shifts2contracts s2c ON d2s.shift_id = s2c.id
        WHERE ${driver_id ? `d2s.driver_id = ${driver_id}` : 1}
            AND s2c.is_completed = 1
            AND ${`s2c.date_start BETWEEN '${sideLeftDate}' AND '${sideRightDate}'`}
    `);


    const result = [];

    for (const carReserv of carReservs) {
        const { id, created_at, driver_salary: sum } = carReserv;
        const formatedDate = moment(created_at).format('DD.MM.YYYY');

        const startTime = moment(carReserv.rent_start).format('DD.MM.YYYY, HH:mm');

        result.push({
            id,
            sum,
            description: `Заявка №${id}`,
            reservId: id,
            date: formatedDate,
            itinerarie_name: carReserv.itinerarie_name,
            passenger_name: carReserv.passenger_name,
            customer_name: carReserv.customer_name,
            startTime,
            itinerarie_point_b: carReserv.itinerarie_point_b
        });
    }

    for (const shift of shifts) {
        const { id, create_at, value: salaryRate, hours, shift_start } = shift;
        const formatedDate = moment(create_at).format('DD.MM.YYYY');

        const startTime = moment(shift_start).format('DD.MM.YYYY, HH:mm');

        const sum = salaryRate * hours;

        result.push({
            id,
            shiftId: id,
            sum,
            description: `Смена №${shift.shift_id} по контракту №${shift.contract_id}`,
            date: formatedDate,
            itinerarie_name: '',
            passenger_name: '',
            customer_name: '',
            code: 'muz',
            startTime,
            itinerarie_point_b: ''
        });
    }

    const total = result.reduce((prev, cur) => +prev + +cur.sum, 0);

    return { total, details: result };
}