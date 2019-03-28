const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    if (!id)
        throw new Error('Отсутствует id');

    if (!Number(id))
        throw new Error('Id type error');

    const storages = await db.execQuery(`SELECT * FROM cash_storages WHERE id = ?`, [id]);

    res.render(__dirname + '/cash-storages-view', { storages });
}