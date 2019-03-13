const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const services = await db.execQuery(`SELECT * FROM services ORDER BY title`);
    const masters = await db.execQuery(`SELECT * FROM employees WHERE access_id = 2`);

    return res.render(__dirname + '/home', { services, masters });
};