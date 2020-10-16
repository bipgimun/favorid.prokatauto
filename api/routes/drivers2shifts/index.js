const router = require('express').Router();
const db = require('../../../libs/db');

const {
    muzContractsModel
} = require('../../../models');

router.post('/update', async (req, res, next) => {

    const { drivers, ...values } = req.body;

    const { id: shiftId, ...shiftUpdate } = values;

    if(!shiftId) {
        throw new Error('Отсутствует id смены');
    }

    const canUpdate = [+req.session.user.is_director, +req.session.user.is_senior_manager].includes(1);
    const canUpdateCompletedContract = [+req.session.user.is_director].includes(1);

    const [shift] = await db.execQuery(`SELECT * FROM shifts2contracts WHERE id = ?`, [shiftId]);

    if(!shift) {
        throw new Error('Смена не найдена');
    }

    if((+shift.is_completed === 1 && !canUpdateCompletedContract) || !canUpdate) {
        throw new Error('Нет прав для данного действия');
    }

    for (const driver of drivers) {
        const { id, ...setData } = driver;

        await db.execQuery(`UPDATE drivers2shifts SET ? WHERE id = ?`, [setData, id]);
    }

    await db.execQuery('UPDATE shifts2contracts SET ? WHERE id = ?', [shiftUpdate, shiftId]);

    res.json({ status: 'ok', body: req.body });
})

module.exports = router;