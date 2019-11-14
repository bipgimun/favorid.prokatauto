const db = require('../../libs/db');

class CarReservation {
    constructor() {
        this.id = '';
        this.customer_id = '';
        this.contact_number = '';
        this.passenger_id = '';
        this.rent_start = '';
        this.rent_finished = '';
        this.manager_id = '';
        this.driver_id = '';
        this.driver_name = '';
        this.car_id = '';
        this.status_name = '';
        this.class_name = '';
        this.has_driver = '';
        this.itinerarie_id = '';
        this.driver_salary = '';
        this.services = '';
        this.prepayment = '';
        this.discount = '';
        this.comment = '';
        this.sum = '';
        this.status = '';
        this.created_at = '';
        this.itinerarie_point_a = '';
        this.itinerarie_point_b = '';
        this.passenger_name = '';
        this.itinerarie_name = undefined;
    }

}

/** @return {Promise<CarReservation[]>} возвращает массив аренды авто */
exports.get = ({
    id = '',
    ids = '',
    fromPeriod = '',
    endPeriod = '',
    customer = '',
    hasDriver = '',
    driver_id = '',
    passenger_id = '',
    car_id = '',
    manager_id = '',
    statuses = '',
    closeLeft = '',
    closeRight = '',
    rentStart = '',
    rentFinished = '',
    rentStartGt = '',
    rentStartLt = '',
    rentFinishedGt = '',
    rentFinishedLt = '',
    isArchive = null
} = {}) => {

    return db.execQuery(`
         SELECT cr.*,
            c.name as car_name,
            c.model as car_model,
            c.number as car_number,
            c.mileage as car_mileage,
            c.fuel_level as car_fuel_level,
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
            ${passenger_id ? `AND cr.passenger_id = ${passenger_id}` : ''}
            ${car_id ? `AND cr.car_id = ${car_id}` : ''}
            ${manager_id ? `AND cr.manager_id = ${manager_id}` : ''}
            ${ids ? `AND cr.id IN (${ids})` : ''}
            ${fromPeriod ? `AND DATE(cr.created_at) >= '${fromPeriod}'` : ''}
            ${endPeriod ? `AND DATE(cr.created_at) <= '${endPeriod}'` : ''}
            
            ${rentStart ? `AND cr.rent_start >= '${rentStart}'` : ''}
            ${rentFinished ? `AND cr.rent_finished <= '${rentFinished}'` : ''}
            
            ${rentStartGt ? `AND cr.rent_start >= '${rentStartGt}'` : ''}
            ${rentStartLt ? `AND cr.rent_start <= '${rentStartLt}'` : ''}
            
            ${rentFinishedGt ? `AND cr.rent_finished >= '${rentFinishedGt}'` : ''}
            ${rentFinishedLt ? `AND cr.rent_finished <= '${rentFinishedLt}'` : ''}
            
            ${closeLeft ? `AND DATE(cr.close_at) >= DATE('${closeLeft}')` : ''}
            ${closeRight ? `AND DATE(cr.close_at) <= DATE('${closeRight}')` : ''}
            ${customer ? `AND cr.customer_id = ${customer}` : ''}
            ${hasDriver ? `AND cr.has_driver = ${hasDriver}` : ''}
            ${statuses ? `AND cr.status IN (${statuses})` : ''}
            ${isArchive === true
                ? `AND cr.status IN (2)`
                : isArchive === false
                    ? `AND cr.status NOT IN (2)`
                    : ''
            }
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