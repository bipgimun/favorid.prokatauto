const db = require('../../libs/db');
const APARTMENT_STATUSES = require('../../config/apartment-statuses');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    if (!id)
        throw new Error('Отсутствует id');

    if (!Number(id))
        throw new Error('Id type error');

    const apartmentReservations = await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name,
            c.name as customer_name,
            p.contact_number as client_number,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
            LEFT JOIN customers c ON ar.customer_id = c.id
             LEFT JOIN employees e ON ar.manager_id = e.id
        WHERE
            ar.id = ?
    `, [id])

    apartmentReservations.forEach(item => {
        item.status_name = APARTMENT_STATUSES.get(item.status);
        item.nonEditable = [APARTMENT_STATUSES.get('AT_RECEPTION'), APARTMENT_STATUSES.get('COMPLETED')].includes(+item.status);
        item.completed = item.status == APARTMENT_STATUSES.get('COMPLETED');
    });

    const [reservation = {}] = apartmentReservations;

    if (!reservation.id)
        throw new Error('Reservation not found');

    const servicesList = await db.execQuery(`SELECT * FROM additional_services`);

    const additionalServices = (reservation.services || '')
        .split(',')
        .map(item => servicesList.find(service => service.id == item));

    const customers = await db.execQuery(`SELECT * FROM customers`);

    customers.map(item => {
        if (item.id == reservation.customer_id) {
            item.selected = true;
        }
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

    const servicesIds = (reservation.services || '').split(',');

    const servicesWithSelected = additionalServices
        .filter(item => item && item.id)
        .map(item => {
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
        servicesList,
        id,
        reservation
    });
};