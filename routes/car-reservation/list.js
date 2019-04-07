const db = require('../../libs/db');

module.exports = async (req, res, next) => {
    
    
    const reservs = await db.execQuery(`
        SELECT cp.*,
            c.name as customer_name,
            p.name as passenger_name,
            d.name as driver_name
        FROM cars_reservations cp
            LEFT JOIN customers c ON c.id = cp.customer_id
            LEFT JOIN passengers p ON p.id = cp.passenger_id
            LEFT JOIN drivers d ON d.id = cp.driver_id
    `);
    
    const customers = await db.execQuery(`SELECT * FROM customers`);
    
    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const carPrices = await db.execQuery('SELECT * FROM cars_price');
    const cashStorages = await db.execQuery('SELECT * FROM cash_storages');
    const itineraries = await db.execQuery('SELECT * FROM itineraries');
    const drivers = await db.execQuery('SELECT * FROM drivers');

    res.render(__dirname + '/car-reservation-list', { reservs, customers, passengers, carPrices, cashStorages, itineraries, drivers });
}