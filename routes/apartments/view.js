const db = require('../../libs/db');

module.exports = async (req, res, next) => {
    const { id } = req.params;
    const apartments = await db.execQuery(`SELECT * FROM apartments WHERE id = ?`, [id]);

    res.render(__dirname + '/apartments-view.hbs', { apartments });
}