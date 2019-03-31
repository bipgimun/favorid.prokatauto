const db = require('../../libs/db');

module.exports = async (req, res, next) => {
    const { id } = req.params;
    const customers = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [id]);

    res.render(__dirname + '/customer-view.hbs', { customers });
}