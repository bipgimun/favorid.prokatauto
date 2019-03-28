const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const customers = await db.execQuery(`SELECT * FROM customers`);

    res.render(__dirname + '/customers-list', { customers });
}