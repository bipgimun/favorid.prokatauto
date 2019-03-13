const db = require('../db');

module.exports = async (date) => {
    const result = {
        incomes: 0,
        costs: 0,
        balance: 0,
    };

    const salesGoods = await db.execQuery(`SELECT * FROM sales_goods WHERE DATE(created) <= '${date}'`);
    const salesServices = await db.execQuery(`SELECT * FROM sales_services WHERE DATE(created) <= '${date}'`);
    const otherIncomes = await db.execQuery(`SELECT * FROM incomes WHERE DATE(created) <= '${date}'`);
    const costs = await db.execQuery(`SELECT * FROM costs WHERE DATE(created) <= '${date}'`);

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

    result.balance = result.incomes - result.costs;

    return result.balance;
};