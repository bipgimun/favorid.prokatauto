const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    if (!id)
        throw new Error('Отсутствует id');

    if (!Number(id))
        throw new Error('Id type error');

    const storages = await db.execQuery(`SELECT * FROM cash_storages WHERE id = ?`, [id]);
    const [storage = {}] = storages;

    const costs = await db.execQuery(`SELECT * FROM costs WHERE cash_storage_id = ?`, [id]);
    const incomes = await db.execQuery(`SELECT * FROM incomes WHERE cash_storage_id = ?`, [id]);

    const costsSum = costs.reduce((acc, item) => acc + +item.sum, 0);
    const incomesSum = incomes.reduce((acc, item) => acc + +item.sum, 0);

    const balance = incomesSum - costsSum;

    if (!storage.id)
        return next();

    res.render(__dirname + '/cash-storages-view', {
        storages,
        balance
    });
}