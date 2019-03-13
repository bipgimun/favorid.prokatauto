const db = require('../../../libs/db');

module.exports = async (req, res, next) => {
    try {
        const { datas } = req.body;
        const { employee_id: admin_id } = req.session.user;

        const errors = datas.reduce((prev, body, index) => {
            const { date, good_id, count } = body;
            index = index + 1;

            if (!date)
                prev.push(`Строка ${index}: Не выбрана дата прихода`);

            if (!good_id)
                prev.push(`Строка ${index}: Не выбран товар`);

            if (!count || +count < 1)
                prev.push(`Строка ${index}: Отсутствует количество`);

            return prev;
        }, []);

        if (errors.length)
            throw new Error('Ошибки в заполнении товаров:\n' + errors.join('\n'));

        for (const body of datas) {
            const { date, good_id, count } = body;

            const [good = {}] = await db.execQuery(`SELECT * FROM goods WHERE id = ?`, good_id);

            if (!good.id)
                continue;

            const price = good.purchase_price;
            const sum = price * count;

            await db.insertQuery(`INSERT INTO coming_goods SET ?`, { admin_id, good_id, count, price, sum, date });
        }

        return res.json({ status: 'ok' });
    } catch (error) {
        return res.json({ status: 'bad', message: error.message });
    }
}