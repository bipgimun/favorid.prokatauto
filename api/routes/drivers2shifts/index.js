const router = require('express').Router();
const db = require('../../../libs/db');

const {
    muzContractsModel
} = require('../../../models');

router.post('/update', async (req, res, next) => {

    const { drivers, ...values } = req.body;

    for (const driver of drivers) {
        const { id, ...setData } = driver;

        await db.execQuery(`UPDATE drivers2shifts SET ? WHERE id = ?`, [setData, id]);
    }

    const { id: shiftId, ...shiftUpdate } = values;

    if(!shiftId) {
        throw new Error('Отсутствует id смены');
    }

    await db.execQuery('UPDATE shifts2contracts SET ? WHERE id = ?', [shiftUpdate, shiftId]);

    res.json({ status: 'ok', body: req.body });
})

module.exports = router;