const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const services = await db.execQuery(`SELECT * FROM additional_services`);

    res.render(__dirname + '/services-list', { services });
}