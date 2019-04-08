const db = require('../../libs/db');

const statues = {
    '0': 'Новая заявка',
    '1': 'В работе',
    '2': 'Завершена'
};

module.exports = async (req, res, next) => {


    const reservs = await db.execQuery(`
        SELECT cr.*,
            c.name as car_name,
            c.model as car_model,
            c.number as car_number,
            cu.name as customer_name,
            cu.discount as customer_discount,
            p.name as passenger_name,
            d.name as driver_name,
            i.name as itinerarie_name,
            cs.name as cash_storage_name
        FROM cars_reservations cr
            LEFT JOIN cars c ON c.id = cr.car_id
            LEFT JOIN customers cu ON cu.id = cr.customer_id
            LEFT JOIN passengers p ON p.id = cr.passenger_id
            LEFT JOIN drivers d ON d.id = cr.driver_id
            LEFT JOIN cars_price cp ON cp.id = cr.price_id
            LEFT JOIN itineraries i ON i.id = cr.itinerarie_id
            LEFT JOIN cash_storages cs ON cs.id = cr.cash_storage_id
    `);

    reservs.forEach(item => {
        item.status_name = statues[String(item.status)];
    })

    const customers = await db.execQuery(`SELECT * FROM customers`);

    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const carPrices = await db.execQuery('SELECT * FROM cars_price');
    const cashStorages = await db.execQuery('SELECT * FROM cash_storages');
    const itineraries = await db.execQuery('SELECT * FROM itineraries');
    const drivers = await db.execQuery('SELECT * FROM drivers');

    res.render(__dirname + '/car-reservation-list', { reservs, customers, passengers, carPrices, cashStorages, itineraries, drivers });
}