const moment = require('moment');
const db = require('../db');
const getLastBalance = require('./calc-last-balance');

const USER_FORMAT = 'DD.MM.YYYY';

const PERIOD_FORMAT = (date, selectedDate) => `С ${date.format(USER_FORMAT)} по ${selectedDate.format(USER_FORMAT)}`;

module.exports = async ({ period = '', leftDate = new Date(), rightDate = new Date() } = {}) => {

    const periodArray = [];

    if (period === 'month') {
        periodArray.push(30, 'days');
    }
    else if (period === 'week') {
        periodArray.push(7, 'days');
    }
    else if (period === 'year') {
        periodArray.push(365, 'days');
    }
    else {
        periodArray.push(1, 'days');
    }

    const selectedLeftDate = moment(leftDate);
    const selectedRightDate = moment(rightDate);

    const result = {
        costs: 0,
        balance: 0,
        incomes: 0,
        lastBalance: 0,
        costsOfTime: 0,
        incomesOfTime: 0,
        dateOfLastBalance: moment(selectedLeftDate).subtract(...periodArray).format(USER_FORMAT),
        date: PERIOD_FORMAT(selectedLeftDate.subtract(...periodArray).add(1, 'd'), selectedRightDate),
    };

    const sideLeftDate = moment(selectedLeftDate).subtract(...periodArray).hour(23).minute(59).second(59).format('YYYY-MM-DD HH:mm:ss');
    const sideRightDate = moment(selectedRightDate).hour(23).minute(59).second(59).format('YYYY-MM-DD HH:mm:ss');

    const salesGoods = await db.execQuery(`SELECT * FROM sales_goods WHERE DATE(created) BETWEEN '${sideLeftDate}' AND '${sideRightDate}'`);
    const salesServices = await db.execQuery(`SELECT * FROM sales_services WHERE DATE(created) BETWEEN '${sideLeftDate}' AND '${sideRightDate}'`);
    const otherIncomes = await db.execQuery(`SELECT * FROM incomes WHERE DATE(created) BETWEEN '${sideLeftDate}' AND '${sideRightDate}'`);
    const costs = await db.execQuery(`SELECT * FROM costs WHERE DATE(created) BETWEEN '${sideLeftDate}' AND '${sideRightDate}'`);

    result.lastBalance = await getLastBalance(sideLeftDate);

    salesGoods.forEach(saleGood => {
        result.incomes += Number(saleGood.sum);
    });

    salesServices.forEach(saleService => {
        result.incomes += Number(saleService.price);
    });

    otherIncomes.forEach(income => {
        result.incomes += Number(income.sum);
    });

    costs.forEach(cost => {
        result.costs += Number(cost.sum);
    });

    result.incomesOfTime = Number(result.incomes);
    result.balance = result.incomesOfTime - result.costs;

    return result;
};