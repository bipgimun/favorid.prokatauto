const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    if (!id)
        throw new Error('Отсутствует id');

    if (!Number(id))
        throw new Error('Id type error');

    const itineraries = await db.execQuery(`SELECT * FROM itineraries WHERE id = ?`, [id]);

    res.render(__dirname + '/itineraries-view', { itineraries });
}