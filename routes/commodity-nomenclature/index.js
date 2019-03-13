const db = require('../../libs/db');

module.exports = async (req, res, next) => {
    const goods = await db.execQuery(`SELECT * FROM goods`);
    const services = await db.execQuery(`SELECT title FROM services`);
    return res.render(__dirname + '/commodity-nomenclature', { goods, services });
};