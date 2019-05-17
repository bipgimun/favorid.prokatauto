const db = require('../../libs/db');

exports.add = ({
    customer_id = '',
    period_from = '',
    period_end = '',
    sum = '',
} = {}) => {

    if (!customer_id)
        throw new Error('Отсутствует customer_id');

    if (!period_from)
        throw new Error('Отсутствует period_from');

    if (!period_end)
        throw new Error('Отсутствует period_end');

    if (!sum)
        throw new Error('Отсутствует sum');

    return db.insertQuery(`INSERT INTO detailing_cars SET ?`, { customer_id, period_from, period_end, sum });
}

exports.get = ({ id = '' } = {}) => {
    return db.execQuery(`
        SELECT dc.*,
            cu.name as customer_name
        FROM detailing_cars dc
            LEFT JOIN customers cu ON cu.id = dc.customer_id
        WHERE
            dc.id > 0
            ${id ? `AND dc.id = ${id}` : ''}
    `);
};