const router = require('express').Router();
const db = require('../../../libs/db');

const {
    muzContractsModel
} = require('../../../models');

router.post('/add', async (req, res, next) => {


    const { drivers, ...values } = req.body;

    if (!values.contract_id) {
        throw new Error('Не выбран контракт');
    }

    const [contract] = await db.execQuery('SELECT * FROM muz_contracts WHERE id = ?', [values.contract_id]);

    if (!contract) {
        throw new Error('Контракт не найден');
    }

    if (contract.is_completed == '1') {
        throw new Error('Нельзя открыть смену: контракт уже завершен')
    }

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

    const [shift] = await db.execQuery(`SELECT * FROM shifts2contracts WHERE id = ${shift_id}`);

    if(!shift) {
        throw new Error('Смена не найдена');
    }

    if(+shift.is_completed === 1) {
        throw new Error('Смена уже завершена');
    }

    await db.execQuery(`UPDATE shifts2contracts SET ? WHERE id = ${shift_id}`, [
        { is_completed: 1, complete_at: new Date() }
    ]);

    res.json({ status: 'ok' })
})

router.post('/update', async (req, res, next) => {
    const { drivers, ...values } = req.body;
    res.json({ status: 'ok', body: req.body });
})

router.post('/delete', async (req, res, next) => {
    const { id } = req.body;

    const [shift] = await db.execQuery('SELECT id FROM shifts2contracts WHERE id = ?', [id]);

    if (!shift) {
        throw new Error('Смена не найдена');
    }

    await db.execQuery('DELETE FROM shifts2contracts WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

module.exports = router;