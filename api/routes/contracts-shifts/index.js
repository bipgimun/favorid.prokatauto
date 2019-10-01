const router = require('express').Router();
const db = require('../../../libs/db');

const {
    muzContractsModel
} = require('../../../models');

router.post('/add', async (req, res, next) => {


    const { drivers, ...values } = req.body;

    const shift_id = await db.insertQuery(`INSERT INTO shifts2contracts SET ?`, { ...values, manager_id: req.session.user.employee_id });

    for (const driver of drivers) {
        await db.insertQuery(`INSERT INTO drivers2shifts SET ?`, { ...driver, shift_id });
    }

    res.json({ status: 'ok', body: req.body });
});


router.post('/close', async (req, res, next) => {
    const { id: shift_id } = req.body;

    if (!shift_id) {
        throw new Error('Отсутствует номер смены');
    }

    await db.execQuery(`UPDATE shifts2contracts SET ? WHERE id = ${shift_id}`, [
        { is_completed: 1, complete_at: new Date() }
    ]);

    res.json({ status: 'ok' })
})

router.post('/update', async (req, res, next) => {

    const { drivers, ...values } = req.body;

    console.log(req.body);

    res.json({ status: 'ok', body: req.body });
})

module.exports = router;