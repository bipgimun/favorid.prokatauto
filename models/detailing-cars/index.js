const db = require('../../libs/db');

exports.get = ({ id = '' } = {}) => {
    return db.execQuery(`
        SELECT dc.*,
            cu.name as customer_name,
            p.name as client_name
        FROM detailing_cars dc
            LEFT JOIN customers cu ON cu.id = dc.customer_id
            LEFT JOIN passengers p ON p.id = client_id
    `);
};