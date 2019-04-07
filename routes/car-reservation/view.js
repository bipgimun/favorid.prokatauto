const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    const reservs = await db.execQuery(`
        SELECT cp.*,
            c.name as car_name,
            c.model as car_model
        FROM cars_reservations cp
            LEFT JOIN cars c ON c.id = cp.car_id
        WHERE cp.id = ?`, [id]
    );

    const customers = await db.execQuery(`SELECT * FROM customers`);
    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const drivers = await db.execQuery('SELECT * FROM drivers');
    const cars = await db.execQuery('SELECT * FROM cars');
    const itineraries = await db.execQuery('SELECT * FROM itineraries');
    const cashStorages = await db.execQuery('SELECT * FROM cash_storages');

    const carPrices = await db.execQuery('SELECT * FROM cars_price');

    res.render(__dirname + '/car-reservation-view', {
        reservs,
        customers,
        passengers,
        drivers,
        cars,
        itineraries,
        cashStorages,
    });
}