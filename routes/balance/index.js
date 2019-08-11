const router = require('express').Router();
const {
    drivers: driversModel
} = require('../../models');

router.get('/', async (req, res, next) => {

    const drivers = await driversModel.get();

    res.render(__dirname + '/balance', {
        drivers,
    });
})

module.exports = router;