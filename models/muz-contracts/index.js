const db = require('../../libs/db');

exports.get = ({
    id = '',
    is_completed = ''
} = {}) => {
    return db.execQuery(`
        SELECT mc.*,
            c.name as customer_name,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name,
            mc.total_value as sum
        FROM muz_contracts mc
            LEFT JOIN customers c ON mc.customer_id = c.id
            LEFT JOIN employees e ON mc.manager_id = e.id
        WHERE mc.id > 0
        ${id ? `AND mc.id = ${id}` : ''}
        ${is_completed ? `AND is_completed = '${is_completed}'` : ``}
    `);
};

exports.add = (values) => {

    const v = {};

    for(const key in values) {
        if(values[key]) {
            v[key] = values[key];
        }
    }

    return db.insertQuery(`INSERT INTO muz_contracts SET ?`, [v]);
}