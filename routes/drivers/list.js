const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const drivers = await db.execQuery(`SELECT * FROM drivers ORDER BY name ASC`);
    const cars = await db.execQuery(`SELECT * FROM cars`);

    res.render(__dirname + '/drivers-list', { drivers, cars });
}