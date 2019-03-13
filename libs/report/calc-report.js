const moment = require('moment');
const db = require('../db');
const DATE_FORMAT = 'YYYY-MM-DD';

module.exports = async ({ leftDate = new Date(), rightDate = new Date() }) => {

    const beginDate = moment(leftDate).format(DATE_FORMAT);
    const endDate = moment(rightDate).format(DATE_FORMAT);

    const services = await db.execQuery(`
        SELECT ss.*,
            s.title 
        FROM sales_services ss
            LEFT JOIN services s ON s.id = ss.service_id
        WHERE DATE(created) BETWEEN '${beginDate}' AND '${endDate}'
    `);

    const costs = await db.execQuery(`
        SELECT c.*, 
            cc.title as category_title 
        FROM costs c 
            LEFT JOIN costs_categories cc ON cc.id = c.category_id 
        WHERE DATE(c.created) BETWEEN '${beginDate}' AND '${endDate}'
    `);

    const costsCategories = await db.execQuery(`SELECT * FROM costs_categories`);

    const goods = await db.execQuery(`
        SELECT * 
        FROM sales_goods
        WHERE DATE(created) BETWEEN '${beginDate}' AND '${endDate}'
    `);

    const incomes = (await db.execQuery(`
        SELECT * 
        FROM incomes
        WHERE DATE(created) BETWEEN '${beginDate}' AND '${endDate}'
    `)).reduce((acc, item) => +acc + +item.sum, 0);

    const servicesGrouped = (await db.execQuery(`SELECT * FROM services`))
        .reduce((acc, item) => (acc[item.title] = 0, acc), {});

    services.reduce((acc, item) => {
        const { title } = item;
        acc[title] += +item.price;
        return acc;
    }, servicesGrouped);

    const salon = services
        .reduce((acc, item) => +acc + +item.price, 0);

    const salonEmployees = services
        .reduce((acc, item) => +acc + +item.percent_admin + +item.percent_master, 0);

    const shop = goods
        .reduce((acc, item) => +acc + +item.sum, 0);

    const totalCosts = costs
        .reduce((acc, item) => +acc + +item.sum, 0);

    const costsByCategory = costsCategories.reduce((acc, item) => {
        acc[item.title] = 0;
        return acc;
    }, {});

    costs.reduce((acc, item) => {
        const { category_title: title, sum } = item;

        acc[title] += Number(sum);

        return acc;
    }, costsByCategory);

    const proceeds = +salon + +shop + +incomes;
    const grossProfit = proceeds - salonEmployees;
    const profit = grossProfit - totalCosts;

    const profitability = Number.isFinite((profit / proceeds))
        ? (((profit / proceeds) || 0) * 100).toFixed(2)
        : 'Ошибка, деление на ноль';

    return { salon, shop, incomes, proceeds, salonEmployees, grossProfit, totalCosts, profit, profitability, costsByCategory, servicesGrouped, beginDate, endDate };
}