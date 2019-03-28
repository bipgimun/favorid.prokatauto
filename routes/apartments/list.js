const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const apartments = await db.execQuery(`SELECT * FROM apartments`);

    res.render(__dirname + '/apartments.hbs', { apartments });
}