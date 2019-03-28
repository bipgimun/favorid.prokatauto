const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const storages = await db.execQuery(`SELECT * FROM cash_storages`);

    res.render(__dirname + '/cash-storages-list', { storages });
}