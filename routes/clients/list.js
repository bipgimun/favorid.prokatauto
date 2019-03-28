const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const passengers = await db.execQuery(`SELECT * FROM passengers`);

    res.render(__dirname + '/clients-list', { passengers });
}