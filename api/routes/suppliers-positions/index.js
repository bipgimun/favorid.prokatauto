const router = require('express').Router();

const joi = require('joi');

const addSchema = joi.object({
    name: joi.string().required(),
    cost: joi.number().required(),
});

const {
    suppliersPositionsModel,
} = require('../../../models');

router.post('/add', async (req, res, next) => {
    const values = await addSchema.validate(req.body);
    suppliersPositionsModel.add(values);
    res.json({ status: 'ok', data: values });
})

router.get('/getSelect2', async (req, res, next) => {
    const positions = await suppliersPositionsModel.get();
    res.json({ items: positions });
})

module.exports = router;