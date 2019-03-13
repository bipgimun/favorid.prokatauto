const db = require('../../../libs/db');
const calcCashbox = require('../../../libs/cashbox/calc');

module.exports = async (req, res, next) => {
    try {
        const { category_id, sum, comment = '' } = req.body;
        const { employee_id: admin_id } = req.session.user;

        if (!category_id)
            throw new Error('Отсутствует категория расхода');

        if (!sum || +sum < 1)
            throw new Error('Отсутствует сумма расхода');

        const { balance } = await calcCashbox();

        if (Number(balance) < Number(sum))
            throw new Error('Недостаточно денег в кассе');

        await db.insertQuery(`INSERT INTO costs SET ?`, { admin_id, category_id, sum, comment });

        return res.json({ status: 'ok' });
    } catch (error) {
        return res.json({ status: 'bad', message: error.message });
    }
}