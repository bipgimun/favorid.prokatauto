const router = require('express').Router();

const {
    suppliersDealsModel,
} = require('../../models');

router.get('/', async (req, res, next) => {

    const deals = await suppliersDealsModel.get();

    return res.render(__dirname + '/suppliers-deals-list', {
        deals
    })
})

router.get('/:id', async (req, res, next) => {

    const [document] = await suppliersDealsModel.get({ id: req.params.id });

    if (!document)
        throw new Error('Сделка не найдена');

    return res.render(__dirname + '/suppliers-deals-view', {
        document
    })
})

module.exports = router;