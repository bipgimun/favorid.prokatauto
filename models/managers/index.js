const db = require('../../libs/db');

exports.get = () => {
    return db.execQuery(`
            SELECT m.*,
                e.first_name,
                e.last_name,
                e.middle_name
            FROM managers m
                LEFT JOIN employees e ON m.employee_id = e.id`);
};