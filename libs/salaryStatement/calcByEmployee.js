const moment = require('moment');
const db = require('../db');

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const { carsReservsModel } = require('../../models');

module.exports = async ({ driver_id, leftDate = new Date(), rightDate = new Date() }) => {

    const sideLeftDate = moment(leftDate).add(-1, 'd').hours(23).minutes(59).seconds(59).format(DATE_FORMAT);
    const sideRightDate = moment(rightDate).hour(23).minute(59).second(59).format(DATE_FORMAT);

    const carReservs = await carsReservsModel.get({
        driver_id,
        fromPeriod: sideLeftDate,
        endPeriod: sideRightDate,
        statuses: '2'
    });

    const result = [...carReservs]
        .sort((a, b) => (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()))
        .map(item => {

            const { id, created_at, driver_salary: sum } = item;
            const formatedDate = moment(created_at).format('DD.MM.YYYY');

            return {
                id,
                sum,
                description: `Заявка №${id}`,
                date: formatedDate,
            };
        });

    const total = result.reduce((prev, cur) => +prev + +cur.sum, 0);

    return { total, details: result };
}