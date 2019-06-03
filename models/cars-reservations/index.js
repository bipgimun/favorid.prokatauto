const db = require('../../libs/db');

class CarReservation {
    id = '';
    customer_id = '';
    contact_number = '';
    passenger_id = '';
    rent_start = '';
    rent_finished = '';
    manager_id = '';
    driver_id = '';
    driver_name = '';
    car_id = '';
    class_name = '';
    has_driver = '';
    itinerarie_id = '';
    driver_salary = '';
    services = '';
    prepayment = '';
    discount = '';
    comment = '';
    sum = '';
    status = '';
    created_at = '';
}

/** @return {Promise<CarReservation[]>} asdasdasd */
exports.get = ({
    id = '',
    ids = '',
    fromPeriod = '',
    endPeriod = '',
    customer = '',
    hasDriver = '',
    driver_id = '',
    statuses = '',
    closeLeft = '',
    closeRight = '',
    isArchive = null
} = {}) => {
    return db.execQuery(`
         SELECT cr.*,
            c.name as car_name,
            c.model as car_model,
            c.number as car_number,
            cu.name as customer_name,
            cu.discount as customer_discount,
            p.name as passenger_name,
            d.name as driver_name,
            i.name as itinerarie_name,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM cars_reservations cr
            LEFT JOIN cars c ON c.id = cr.car_id
            LEFT JOIN customers cu ON cu.id = cr.customer_id
            LEFT JOIN passengers p ON p.id = cr.passenger_id
            LEFT JOIN drivers d ON d.id = cr.driver_id
            LEFT JOIN itineraries i ON i.id = cr.itinerarie_id
            LEFT JOIN employees e ON e.id = cr.manager_id
        WHERE
            cr.id > 0
            ${id ? `AND cr.id = ${id}` : ''}
            ${driver_id ? `AND cr.driver_id = ${driver_id}` : ''}
            ${ids ? `AND cr.id IN (${ids})` : ''}
            ${fromPeriod ? `AND DATE(cr.created_at) >= '${fromPeriod}'` : ''}
            ${endPeriod ? `AND DATE(cr.created_at) <= '${endPeriod}'` : ''}
            ${closeLeft ? `AND DATE(cr.close_at) >= DATE('${closeLeft}')` : ''}
            ${closeRight ? `AND DATE(cr.close_at) <= DATE('${closeRight}')` : ''}
            ${customer ? `AND cr.customer_id = ${customer}` : ''}
            ${hasDriver ? `AND cr.has_driver = ${hasDriver}` : ''}
            ${statuses ? `AND cr.status IN (${statuses})` : ''}
            ${isArchive === true ? `AND cr.status IN (2)` : ''}
    `);
};

exports.update = ({ id, values }) => {

    if (!id)
        throw new Error('missing id');

    if (!Object.keys(values).length) {
        throw new Error('Missing values');
    }

    return db.execQuery(`UPDATE cars_reservations SET ? WHERE id = ?`, [values, id]);
}