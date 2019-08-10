const db = require('../../libs/db');

exports.get = () => {
    return db.execQuery(`
            SELECT m.*,
                e.first_name,
                e.last_name,
                e.middle_name,
                e.is_director,
                e.is_senior_manager,
                e.is_manager,
                e.phone,
                e.id as employee_id
            FROM managers m
                LEFT JOIN employees e ON m.employee_id = e.id`);
};