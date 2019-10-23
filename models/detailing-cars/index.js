const db = require('../../libs/db');

exports.add = ({
    customer_id = '',
    period_from = '',
    period_end = '',
    sum = '',
    manager_id = ''
} = {}) => {

    if (!period_from)
        throw new Error('Отсутствует period_from');

    if (!period_end)
        throw new Error('Отсутствует period_end');

    if (!sum)
        throw new Error('Отсутствует sum');
    
    if (!manager_id)
        throw new Error('Отсутствует manager_id');

    return db.insertQuery(`INSERT INTO detailing_cars SET ?`, { customer_id: customer_id || null, period_from, period_end, sum, manager_id });
}

exports.get = ({ id = '' } = {}) => {
    return db.execQuery(`
        SELECT dc.*,
            cu.name as customer_name,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM detailing_cars dc
            LEFT JOIN customers cu ON cu.id = dc.customer_id
            LEFT JOIN employees e ON e.id = dc.manager_id
        WHERE
            dc.id > 0
            ${id ? `AND dc.id = ${id}` : ''}
    `);
};

exports.delete = ({ id = '' }) => {

    if (!id)
        throw new Error('Отсутствует id');

    return db.execQuery(`DELETE FROM detailing_cars WHERE id = ?`, [id]);
}