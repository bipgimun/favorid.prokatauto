const router = require('express').Router();
const db = require('../../libs/db');

const { drivers: driversModel } = require('../../models/')

router.get('/', async (req, res, next) => {
    const drivers = await driversModel.get();
    res.render(__dirname + '/salary-statement', { drivers });
})

module.exports = router;