const router = require('express').Router();
const Joi = require('joi');
const moment = require('moment');

const addSchema = Joi.object({
    supplier_id: Joi.number().required(),
    position_id: Joi.number().required(),
    date: Joi.date().required(),
    sum: Joi.number().greater(0).required(),
    incoming_document_number: Joi.string(),
    comment: Joi.string().empty(''),
})

const {
    suppliersDealsModel,
} = require('../../../models');

router.post('/add', async (req, res, next) => {

    const values = await addSchema.validate(req.body);

    const id = await suppliersDealsModel.add({ ...values, manager_id: req.session.user.employee_id });
    const [supplierDeal] = await suppliersDealsModel.get({ id });

    supplierDeal.date = moment(supplierDeal.date).format('DD.MM.YYYY');

    res.json({ status: 'ok', data: supplierDeal });
})

module.exports = router;