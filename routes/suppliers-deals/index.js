const router = require('express').Router();

const db = require('../../libs/db');

const {
    suppliersDealsModel,
} = require('../../models');

router.get('/', async (req, res, next) => {

    const deals = await suppliersDealsModel.get({ paid: false });

    return res.render(__dirname + '/suppliers-deals-list', {
        deals
    })
})

router.get('/paid', async (req, res, next) => {

    const deals = await suppliersDealsModel.get({ paid: true });

    return res.render(__dirname + '/suppliers-deals-list', {
        deals,
        paid: true
    })
})

router.get('/:id', async (req, res, next) => {

    const [document] = await suppliersDealsModel.get({ id: req.params.id });

    if (!document)
        throw new Error('Сделка не найдена');


    const costsByDeal = await db.execQuery(`SELECT sum FROM costs WHERE code = ? AND document_id = ?`, ['SD', document.id]);
    const costsSum = costsByDeal.reduce((acc, value) => +acc + +value.sum, 0);

    const remainderCalc = (document.sum - costsSum);
    const reminder = remainderCalc >= 0
        ? remainderCalc
        : 0;

    return res.render(__dirname + '/suppliers-deals-view', {
        document,
        reminder,
        can_edit: req.session.user.is_director == '1' || req.session.user.is_senior_manager == '1' && document.is_paid == '1'
    })
})

module.exports = router;