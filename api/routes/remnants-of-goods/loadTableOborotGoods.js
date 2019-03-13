const moment = require('moment');
const db = require('../../../libs/db');

module.exports = async (req, res, next) => {
    const { leftDate = new Date(), rightDate = new Date() } = req.body;

    const resultObj = {};

    const beginDate = moment(leftDate).format('YYYY-MM-DD');
    const endDate = moment(rightDate).format('YYYY-MM-DD');

    const comingGoods = await db.execQuery(`
        SELECT cg.*,
            g.title
        FROM coming_goods cg
            LEFT JOIN goods g on g.id = cg.good_id
        WHERE DATE(created) BETWEEN '${beginDate}' AND '${endDate}'
    `);

    const salesGoods = await db.execQuery(`
        SELECT sg.*,
            g.title
        FROM sales_goods sg
            LEFT JOIN goods g on g.id = sg.good_id
        WHERE DATE(created) BETWEEN '${beginDate}' AND '${endDate}'
    `);

    comingGoods.reduce((acc, item) => {
        const { count, title } = item;
        acc[title] = acc[title] || { coming: 0, cost: 0 };
        acc[title].coming += count;
        return acc;
    }, resultObj);

    salesGoods.reduce((acc, item) => {
        const { count, title } = item;
        acc[title] = acc[title] || { coming: 0, cost: 0 };
        acc[title].cost += count;
        return acc;
    }, resultObj);

    const resArray = Object.keys(resultObj)
        .map(key => {
            return { title: key, ...resultObj[key] }
        })

    res.render('partials/oborot-goods-table.hbs', { layout: false, oborot: resArray }, (error, html) => {
        res.json({ status: 'ok', body: html });
    });
}