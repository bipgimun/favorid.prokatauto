const db = require('../../../libs/db');

module.exports = async (req, res, next) => {
    const { title, purchase_price, selling_price } = req.body;

    if (!title || !purchase_price || !selling_price)
        return res.json({ status: 'bad', message: 'Отсутствуют необходимые данные для добавления товара в номенклатуру' });

    await db.insertQuery(`INSERT INTO goods SET ?`, { title, purchase_price, selling_price });
    res.json({ status: 'ok' });
}