const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    const prices = await db.execQuery('SELECT * FROM cars_price WHERE id = ?', [id]);

    res.render(__dirname + '/price-view', { prices });
}