const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const reservs = await db.execQuery(`SELECT * FROM cars_reservations`);
    const customers = await db.execQuery(`SELECT * FROM customers`);

    res.render(__dirname + '/car-reservation-list', { reservs, customers });
}