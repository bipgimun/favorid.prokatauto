const express = require('express');
const router = express.Router();

const { costsCategories: costsCategoriesModel } = require('../../../models');

const Joi = require('joi');
const updateSchema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().trim().required()
})

router.post('/add', async (req, res, next) => {
    const id = await costsCategoriesModel.add(req.body.values);
    return res.json({ status: 'ok', data: id });
});

router.post('/get', async (req, res, next) => {
    const costsCategories = await costsCategoriesModel.get();
    return res.json({ status: 'ok', data: costsCategories });
});

router.post('/update', async (req, res, next) => {
    const { id, ...values } = await updateSchema.validate(req.body.values);
    await costsCategoriesModel.update({ id, ...values });
    return res.json({ status: 'ok' });
});

router.post('/delete', async (req, res, next) => {
    const { id } = req.body.values;
    await costsCategoriesModel.delete({ id })
    return res.json({ status: 'ok' });
});

module.exports = router;