const db = require('../../../libs/db');

module.exports = async (req, res, next) => {
    try {
        const { sum, item, comment = '' } = req.body;
        const { employee_id: admin_id } = req.session.user;

        if (!sum || +sum < 1)
            throw new Error('Отсутствует сумма дохода');

        if (!item)
            throw new Error('Отсутствует статья дохода');

        await db.insertQuery(`INSERT INTO incomes SET ?`, { admin_id, item, sum, comment });

        return res.json({ status: 'ok' });

    } catch (error) {
        return res.json({ status: 'bad', message: error.message });
    }
}