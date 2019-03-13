const moment = require('moment');
const db = require('../../../libs/db');

module.exports = async (req, res, next) => {

    const { leftDate, rightDate } = req.body;

    const beginDate = moment(leftDate).format('YYYY-MM-DD');
    const endDate = moment(rightDate).format('YYYY-MM-DD');

    const salesGoods = await db.execQuery(`
        SELECT sg.*,
            g.title
        FROM sales_goods sg
            LEFT JOIN goods g ON g.id = sg.good_id
        WHERE
            DATE(created) BETWEEN '${beginDate}' AND '${endDate}'
    `);

    const goodsResult = salesGoods
        .reduce((acc, item) => {
            const { title, sum, count } = item;

            acc[title] = acc[title] || {
                count: 0,
                sum: 0
            };

            acc[title].count += +count;
            acc[title].sum += +sum;

            return acc;
        }, {});

    const goodsTotalSum = Object.values(goodsResult).reduce((acc, item) => acc + +item.sum, 0);

    res.render('partials/sales-goods-report-table.hbs', { layout: false, goodsResult, goodsTotalSum }, (error, html) => {
        if (error) return res.json({ status: 'bad', message: error.message });

        return res.json({ status: 'ok', body: html });
    });
}