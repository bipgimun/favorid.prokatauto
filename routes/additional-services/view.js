const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    const services = await db.execQuery(`SELECT * FROM additional_services WHERE id = ?`, [id]);

    res.render(__dirname + '/services-view', { services });
}