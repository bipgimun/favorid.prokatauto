const router = require('express').Router();
const db = require('../../../libs/db');

const {
    muzContractsModel
} = require('../../../models');

router.post('/update', async (req, res, next) => {

    const { drivers, ...values } = req.body;

    for(const driver of drivers) {
        const { id, ...setData } = driver;

        await db.execQuery(`UPDATE drivers2shifts SET ? WHERE id = ?`, [setData, id]);
    }

    res.json({ status: 'ok', body: req.body });
})

module.exports = router;