const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const cars = await db.execQuery(`SELECT * FROM cars`);

    res.render(__dirname + '/cars-list', { cars });
}