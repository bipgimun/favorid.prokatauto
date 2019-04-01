const db = require('../../libs/db');

const APARTMENT_STATUS = require('../../config/apartment-statuses');

module.exports = async (req, res, next) => {
    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const apartments = await db.execQuery(`SELECT * FROM apartments`);
    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);
    const additionalServices = await db.execQuery(`SELECT * FROM additional_services`);

    const apartmentReservations = (await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
    `));

    apartmentReservations.forEach(item => {
        item.statusName = APARTMENT_STATUS.get(item.status);
    });

    const customers = await db.execQuery(`SELECT * FROM customers`);

    return res.render(__dirname + '/apartment-reservations', { customers, passengers, apartments, cashStorages, additionalServices, apartmentReservations });
};