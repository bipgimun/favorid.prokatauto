const router = require('express').Router();
const db = require('../../../libs/db');

const {
    muzContractsModel
} = require('../../../models');

router.post('/add', async (req, res, next) => {

    const { drivers, ...values } = req.body;
    const contractId = await muzContractsModel.add({...values, manager_id: req.session.user.employee_id});

    for (const driver of drivers) {
        await db.insertQuery(`INSERT INTO drivers2contracts SET ?`, [{ ...driver, muz_contract_id: contractId }]);
    }

    res.json({ status: 'ok', body: req.body });
})

router.post('/update', async (req, res, next) => {


    res.json({ status: 'ok', body: req.body });
})

module.exports = router;