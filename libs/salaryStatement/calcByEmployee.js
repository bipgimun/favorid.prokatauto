const moment = require('moment');
const db = require('../db');

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

module.exports = async ({ id, leftDate = new Date(), rightDate = new Date() }) => {

    const sideLeftDate = moment(leftDate).add(-1, 'd').hours(23).minutes(59).seconds(59).format(DATE_FORMAT);
    const sideRightDate = moment(rightDate).hour(23).minute(59).second(59).format(DATE_FORMAT);

    const servicesAdmin = await db.execQuery(`
        SELECT ss.*,
            percent_admin as sum,
            s.title as name,
            percent_admin_count as percent,
            'Реализация услуги' as for_what
        FROM 
            sales_services ss
            LEFT JOIN services s ON s.id = ss.service_id
        WHERE 
            DATE(created) BETWEEN '${sideLeftDate}' AND '${sideRightDate}'
            AND admin_id = '${id}'
    `);

    const servicesMaster = await db.execQuery(`
        SELECT *,
            percent_master as sum,
            s.title as name,
            percent_master_count as percent,
            'Реализация услуги' as for_what
        FROM 
            sales_services ss
            LEFT JOIN services s ON s.id = ss.service_id
        WHERE 
            DATE(created) BETWEEN '${sideLeftDate}' AND '${sideRightDate}'
            AND master_id = '${id}'
    `);

    const goodsAdmin = await db.execQuery(`
         SELECT sg.*,
            percent_admin as sum,
            g.title as name,
            percent_admin_count as percent,
            'Реализация товара' as for_what
        FROM 
            sales_goods sg
            LEFT JOIN goods g ON g.id = sg.good_id
        WHERE 
            DATE(created) BETWEEN '${sideLeftDate}' AND '${sideRightDate}'
            AND admin_id = '${id}'
    `);

    const result = [...servicesAdmin, ...servicesMaster, ...goodsAdmin]
        .sort((a, b) => (new Date(a.created).getTime() - new Date(b.created).getTime()))
        .map(item => {
            const { created, sum, for_what: forWhat, name, percent } = item;
            const formatedDate = moment(created).format('DD.MM.YYYY');

            return {
                sum,
                percent,
                description: `${forWhat}: ${name}`,
                date: formatedDate,
            };
        });

    const total = result.reduce((prev, cur) => +prev + +cur.sum, 0);

    return { total, details: result };
}