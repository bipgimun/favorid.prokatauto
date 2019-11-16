const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const cars = await db.execQuery(`SELECT * FROM cars`);
    const apartments = await db.execQuery(`SELECT * FROM apartments`);
    const customers = await db.execQuery(`SELECT * FROM customers`);

    res.render(__dirname + '/units-profitability', {
        cars,
        apartments,
        customers
    });
}