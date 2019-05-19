const db = require('../../libs/db');

exports.get = ({
    id = '',
} = {}) => {
    return db.execQuery(`
        SELECT da.*,
            cu.name as customer_name
        FROM detailing_apartments da
            LEFT JOIN customers cu ON cu.id = da.customer_id
        WHERE da.id > 0
            ${id ? `AND da.id = ${id}` : ''}
    `)
};

exports.add = ({
    customer_id = '',
    period_from = '',
    period_end = '',
    sum = '',
} = { customer_id, period_from, period_end, sum }) => {
    return db.insertQuery(`
        INSERT INTO detailing_apartments SET ?`, { customer_id, period_end, period_from, sum });
}