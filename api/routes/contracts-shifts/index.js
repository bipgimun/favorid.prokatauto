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


router.post('/complete', async(req, res, next) => {

})

router.post('/update', async (req, res, next) => {

     const { drivers, ...values } = req.body;

     console.log(req.body);

    res.json({ status: 'ok', body: req.body });
})

module.exports = router;