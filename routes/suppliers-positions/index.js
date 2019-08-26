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

router.get('/:id', async (req, res, next) => {

    const [position] = await suppliersPositionsModel.get({ id: req.params.id });

    if (!position)
        throw new Error('Позиция не найдена')

    return res.render(__dirname + '/suppliers-positions-view', {
        position,
        id: req.params.id
    })
})

module.exports = router;