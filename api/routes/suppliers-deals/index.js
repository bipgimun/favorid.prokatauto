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

const db = require('../../../libs/db');

router.post('/add', async (req, res, next) => {

    const { values: data, details = '' } = req.body;
    const values = await addSchema.validate(data);

    const [similarDeal] = await db.execQuery(`
        SELECT * 
        FROM suppliers_deals 
        WHERE incoming_document_number = ?
            AND date LIKE ?`,
        [values.incoming_document_number, moment(values.date).format('YYYY-MM-DD')]
    );

    if (similarDeal) {
        throw new Error('Сделка с таким номером и датой уже существует');
    }

    const jsonDetails = JSON.parse(details);

    let splitSum = 0;
    let detailsLength = 0;

    for (const key of Object.keys(jsonDetails)) {
        const detail = jsonDetails[key] || [];

        if (detail.length < 1) {
            continue;
        }

        for (const detItem of detail) {
            const { price } = detItem;

            splitSum += +price;
            detailsLength += 1;
        }
    }
    
    if(+detailsLength > 0 && +splitSum !== +values.sum) {
        throw new Error('Сумма разбивки не равна общей сумме');
    }

    const id = await suppliersDealsModel.add({ ...values, manager_id: req.session.user.employee_id });


    for (const key of Object.keys(jsonDetails)) {
        const detail = jsonDetails[key] || [];

        if (detail.length < 1) {
            continue;
        }

        for (const detItem of detail) {
            const { target_id, price } = detItem;
            await db.insertQuery(`INSERT INTO suppliers_deals_details SET ?`, [{ suppliers_deal_id: id, target_type: key, target_id, price }]);
        }
    }

    const [supplierDeal] = await suppliersDealsModel.get({ id });

    supplierDeal.date = moment(supplierDeal.date).format('DD.MM.YYYY');

    res.json({ status: 'ok', data: supplierDeal });
})

router.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    const [deal] = await db.execQuery('SELECT id FROM suppliers_deals WHERE id = ?', [id]);

    if (!deal) {
        throw new Error('Сделка не найдена!');
    }

    await db.execQuery('DELETE FROM suppliers_deals WHERE id = ?', [id]);

    res.json({
        status: 'ok'
    });
});

module.exports = router;