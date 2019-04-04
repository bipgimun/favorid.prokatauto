const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const names = await db.execQuery(`SELECT name FROM cars GROUP BY name`);

    return res.render(__dirname + '/price-list', { names });
}