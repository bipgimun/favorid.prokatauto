const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    if (!id)
        throw new Error('Отсутствует id');

    if (!Number(id))
        throw new Error('Id type error');

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
        item.at_reception_title = item.at_reception == '1' ? 'На приёме' : 'Не на приёме';
        return item;
    });

    const [reservation = {}] = apartmentReservations;

    if (!reservation.id)
        throw new Error('Reservation not found');

    const additionalServices = reservation.services
        ? (await db.execQuery(`SELECT * FROM additional_services WHERE id IN (${reservation.services})`))
        : [];

    const servicesList = await db.execQuery(`SELECT * FROM additional_services`);


    const customers = (await db.execQuery(`SELECT * FROM customers`))
        .map(item => {
            if (item.id == reservation.customer_id) {
                item.selected = true;
            }

            return item;
        });

    const passengers = (await db.execQuery(`SELECT * FROM passengers`))
        .map(item => {
            if (item.id == reservation.passenger_id) {
                item.selected = true;
            }

            return item;
        });

    const apartments = (await db.execQuery(`SELECT * FROM apartments`))
        .map(item => {
            if (item.id == reservation.apartment_id) {
                item.selected = true;
            }

            return item;
        });

    const cashStorages = (await db.execQuery(`SELECT * FROM cash_storages`))
        .map(item => {
            if (item.id == reservation.cash_storage_id) {
                item.selected = true;
            }

            return item;
        });

    const servicesIds = reservation.services.split(',');

    const servicesWithSelected = additionalServices.map(item => {
        if (servicesIds.includes(String(item.id))) {
            item.selected = true;
        }

        return item;
    });

    return res.render(__dirname + '/apartment-reservation-id', {
        customers,
        passengers,
        additionalServices: servicesWithSelected,
        apartmentReservations,
        apartments,
        cashStorages,
        servicesList
    });
};