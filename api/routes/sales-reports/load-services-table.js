const moment = require('moment');
const db = require('../../../libs/db');

module.exports = async (req, res, next) => {

    const { leftDate, rightDate } = req.body;

    const beginDate = moment(leftDate).format('YYYY-MM-DD');
    const endDate = moment(rightDate).format('YYYY-MM-DD');

    const salesServices = await db.execQuery(`
        SELECT ss.*,
            s.title
        FROM sales_services ss
            LEFT JOIN services s ON ss.service_id = s.id
        WHERE 
            DATE(created) BETWEEN '${beginDate}' AND '${endDate}'
    `);

    const servicesResult = salesServices
        .reduce((acc, item) => {
            const { title, price } = item;

            acc[title] = acc[title] || {
                count: 0,
                sum: 0
            };

            acc[title].count++;
            acc[title].sum += +price;

            return acc;
        }, {});

    const servicesTotalSum = Object.values(servicesResult).reduce((acc, item) => acc + +item.sum, 0);

    res.render('partials/sales-services-report-table.hbs', { layout: false, servicesResult, servicesTotalSum }, (error, html) => {
        if (error) return res.json({ status: 'bad', message: error.message });

        return res.json({ status: 'ok', body: html });
    });
}