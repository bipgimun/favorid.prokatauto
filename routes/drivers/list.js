const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const drivers = await db.execQuery(`SELECT * FROM drivers`);

    res.render(__dirname + '/drivers-list', { drivers });
}