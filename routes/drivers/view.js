const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    const drivers = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [id]);

    res.render(__dirname + '/drivers-view', { drivers });
}