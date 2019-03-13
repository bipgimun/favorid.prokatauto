const getRemnants = require('../../../libs/goods/getRemnants');
const db = require('../../../libs/db');

module.exports = async (req, res, next) => {
    try {
        const { good: good_id, is_purchase_price, count, percent_admin = undefined, comment = '' } = req.body;
        const { employee_id: admin_id } = req.session.user;

        if (!Number(good_id))
            throw new Error('Не выбран товар');

        if (!count || +count < 1)
            throw new Error('Отсутствует количество товаров');

        if (is_purchase_price !== '1' && !percent_admin)
            throw new Error('Отсутствует процент администратора');

        if (+percent_admin < 0 || +percent_admin > 100)
            throw new Error('Неверно задан процент администратора');

        const [good = {}] = await db.execQuery(`SELECT * FROM goods WHERE id = ?`, good_id);

        if (!good.id)
            throw new Error('Товар не найден');

        const remnants = await getRemnants();
        const remnant = remnants.find(remnant => remnant.id == good_id);

        if (!remnant)
            throw new Error('Товара нет в налиции');

        if (+remnant.remnant < +count)
            throw new Error('Недостаточно товара для реализации продажи');

        const price = is_purchase_price !== '1'
            ? good.selling_price
            : 0;

        const sum = count * price;
        const adminSum = sum * (percent_admin / 100);

        await db.insertQuery(`INSERT INTO sales_goods SET ?`, {
            good_id,
            admin_id,
            is_purchase_price,
            count,
            price,
            sum,
            comment,
            percent_admin: adminSum,
            percent_admin_count: percent_admin,
        });

        return res.json({ status: 'ok' });

    } catch (error) {
        console.error(error);
        return res.json({ status: 'bad', message: error.message });
    }
}