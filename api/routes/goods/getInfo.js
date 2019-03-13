const db = require('../../../libs/db');

module.exports = async (req, res, next) => {
    try {
        const { id } = req.body;

        if (!Number(id))
            throw new Error('Нет значения ID');

        const [info = {}] = await db.execQuery(`SELECT * FROM goods WHERE id = ?`, id);

        if (!info.id)
            throw new Error('Товар не найден');

        return res.json({ status: 'ok', body: info });
    } catch (error) {
        res.json({ status: 'bad', message: error.message });
    }
}