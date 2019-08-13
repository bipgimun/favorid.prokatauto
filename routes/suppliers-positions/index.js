const router = require('express').Router();

const {
    suppliersPositionsModel
} = require('../../models');

router.get('/', async (req, res, next) => {

    const positions = await suppliersPositionsModel.get();

    return res.render(__dirname + '/suppliers-positions-list', {
        positions
    })
})

module.exports = router;