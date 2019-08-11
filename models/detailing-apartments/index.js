const db = require('../../libs/db');

exports.get = ({
    id = '',
} = {}) => {
    return db.execQuery(`
        SELECT da.*,
            cu.name as customer_name,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM detailing_apartments da
            LEFT JOIN customers cu ON cu.id = da.customer_id
            LEFT JOIN employees e ON e.id = da.manager_id
        WHERE da.id > 0
            ${id ? `AND da.id = ${id}` : ''}
    `)
};

exports.add = ({
    customer_id = null,
    period_from = null,
    period_end = null,
    sum = null,
    manager_id = null,
} = {}) => {
    return db.insertQuery(`
        INSERT INTO detailing_apartments SET ?`, { customer_id, period_end, period_from, sum, manager_id });
}

exports.delete = ({ id = '' } = {}) => {

    if (!id)
        throw new Error('Отсутствует id')

    return db.insertQuery(`DELETE FROM detailing_apartments WHERE `, [id]);
}