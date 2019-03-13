const db = require('../../../libs/db');

module.exports = async (req, res, next) => {
    const { title } = req.body;

    if (!title)
        return res.json({ status: 'bad', message: 'Отсутствуют необходимые данные для добавления услуги в номенклатуру' });

    await db.insertQuery(`INSERT INTO services SET ?`, { title });
    res.json({ status: 'ok' });
}