const db = require('../../libs/db');

exports.get = ({
    id = '',
    fromPeriod = '',
    endPeriod = '',
    customer = '',
    hasDriver = ''
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
            i.name as itinerarie_name
        FROM cars_reservations cr
            LEFT JOIN cars c ON c.id = cr.car_id
            LEFT JOIN customers cu ON cu.id = cr.customer_id
            LEFT JOIN passengers p ON p.id = cr.passenger_id
            LEFT JOIN drivers d ON d.id = cr.driver_id
            LEFT JOIN cars_price cp ON cp.id = cr.price_id
            LEFT JOIN itineraries i ON i.id = cr.itinerarie_id
        WHERE
            cr.id > 0
            ${id ? `AND cr.id = ${id}` : ''}
            ${fromPeriod ? `AND DATE(cr.created_at) >= '${fromPeriod}'` : ''}
            ${endPeriod ? `AND DATE(cr.created_at) <= '${endPeriod}'` : ''}
            ${customer ? `AND cr.customer_id = ${customer}` : ''}
            ${hasDriver ? `AND cr.has_driver = ${hasDriver}` : ''}
    `);
};