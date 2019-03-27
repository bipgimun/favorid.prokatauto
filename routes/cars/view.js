const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    if (!id)
        throw new Error('Отсутствует id');

    if (!Number(id))
        throw new Error('Id type error');

    const cars = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [id]);

    res.render(__dirname + '/cars-view.hbs', { cars });
}