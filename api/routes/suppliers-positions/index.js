const router = require('express').Router();

const joi = require('joi');

const addSchema = joi.object({
    name: joi.string().required(),
    cost: joi.number().required(),
});

const updateSchema = joi.object({
    name: joi.string(),
    cost: joi.number(),
    id: joi.number().required()
});

const deleteSchema = joi.object({
    id: joi.number().required()
})

const {
    suppliersPositionsModel,
} = require('../../../models');

router.post('/add', async (req, res, next) => {
    const values = await addSchema.validate(req.body);
    const id = await suppliersPositionsModel.add(values);
    res.json({ status: 'ok', data: { ...values, id } });
})

router.post('/update', async (req, res, next) => {
    const { id, ...values } = await updateSchema.validate(req.body);
    const [position] = await suppliersPositionsModel.get({ id });

    if (!position)
        throw new Error('Позиция не найдена')

    await suppliersPositionsModel.update({ id, values });
    return res.json({ status: 'ok', data: values });
})

router.post('/delete', async (req, res, next) => {
    const { id } = await deleteSchema.validate(req.body);
    const [position] = await suppliersPositionsModel.get({ id });

    if (!position)
        throw new Error('Позиция не найдена')

    await suppliersPositionsModel.delete({ id: req.body.id });
    res.json({ status: 'ok' });
})

router.get('/getSelect2', async (req, res, next) => {
    const positions = await suppliersPositionsModel.get();
    res.json({ items: positions });
})

module.exports = router;