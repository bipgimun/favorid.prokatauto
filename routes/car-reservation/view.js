const db = require('../../libs/db');

const statues = {
    '0': 'Новая заявка',
    '1': 'В работе',
    '2': 'Завершена'
};

module.exports = async (req, res, next) => {

    const { id } = req.params;

    const reservs = await db.execQuery(`
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
        WHERE cr.id = ?`, [id]
    );

    const [reservation = {}] = reservs;

    const servicesList = await db.execQuery(`SELECT * FROM additional_services`);

    const additionalServices = (reservation.services || '')
        .split(',')
        .map(item => servicesList.find(service => service.id == item));

    reservs.forEach(item => {
        item.status_name = statues[String(item.status)];
        item.completed = item.status == '2';
    })

    const customers = await db.execQuery(`SELECT * FROM customers`);
    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const drivers = await db.execQuery('SELECT * FROM drivers');
    const cars = await db.execQuery('SELECT * FROM cars');
    const itineraries = await db.execQuery('SELECT * FROM itineraries');

    res.render(__dirname + '/car-reservation-view', {
        reservs,
        customers,
        passengers,
        drivers,
        cars,
        itineraries,
        id,
        item: reservs[0],
        additionalServices,
        servicesList
    });
}