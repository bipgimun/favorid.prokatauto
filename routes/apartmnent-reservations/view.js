const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    if (!id)
        throw new Error('Отсутствует id');

    if (!Number(id))
        throw new Error('Id type error');

    const customers = await db.execQuery(`SELECT * FROM customers`);
    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const apartmentReservations = (await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name,
            c.name as customer_name,
            p.contact_number as client_number,
            cs.name as cash_storage
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
            LEFT JOIN customers c ON ar.customer_id = c.id
            LEFT JOIN cash_storages cs ON ar.cash_storage_id = cs.id
        WHERE
            ar.id = ?
    `, [id])).map(item => {
        item.at_reception = item.at_reception == '1' ? 'На приёме' : 'Не на приёме';
        return item;
    });

    const [item = {}] = apartmentReservations;

    if(!item.id)
        throw new Error('Reservation not found');

    const additionalServices = item.services 
        ? (await db.execQuery(`SELECT * FROM additional_services WHERE id IN (${item.services})`))
        : [];

    return res.render(__dirname + '/apartment-reservation-id', { customers, passengers, additionalServices, apartmentReservations });
};