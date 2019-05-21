const router = require('express').Router();
const Joi = require('joi');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const detailingCarsRegexp = /^(DET-A)-(\d+)$/i;
const detailingApartmentsRegexp = /^(DET-K)-(\d+)$/i;
const apartmentsReservsRegexp = /^(APR)-(\d+)$/i;
const carsReservsRegexp = /^(CRR)-(\d+)$/i;

const printDetail = require('../../../libs/invoice-print');

const {
    invoicesModel,
    detailingApartmentsModel,
    detailingCarsModel,
    apartmentsReservsModel,
    carsReservsModel,
    customersModel,
} = require('../../../models');

const addSchema = Joi.object({
    code: Joi.string().required(),
    sum: Joi.number().min(0).required()
});

router.post('/add', async (req, res, next) => {

    const { code, sum } = await addSchema.validate(req.body);

    let base_id = null;
    let objectModel = null;
    let detailCode;

    if (detailingApartmentsRegexp.test(code)) {
        [, detailCode, base_id] = detailingApartmentsRegexp.exec(code);
        objectModel = detailingApartmentsModel;
    }
    else if (detailingCarsRegexp.test(code)) {
        [, detailCode, base_id] = detailingCarsRegexp.exec(code);
        objectModel = detailingCarsModel;
    }
    else if (apartmentsReservsRegexp.test(code)) {
        [, detailCode, base_id] = apartmentsReservsRegexp.exec(code);
        objectModel = apartmentsReservsModel;
    }
    else if (carsReservsRegexp.test(code)) {
        [, detailCode, base_id] = carsReservsRegexp.exec(code);
        objectModel = carsReservsModel;
    }
    else {
        throw new Error('Неверный код основания');
    }


    const [result = {}] = await objectModel.get({ id: base_id });

    if (!result.id)
        throw new Error('Основание не найдено');

    const { customer_id, sum: detailSum } = result;

    const invoiceId = await invoicesModel.add({ base_id, code: detailCode, customer_id, sum: detailSum });

    const [customer = {}] = await customersModel.get({ id: customer_id });

    const dataArray = [];

    const file = await printDetail({ number: invoiceId, customer, dataArray, date: moment().locale('ru').format('DD MMM YYYY') });

    res.json({
        status: 'ok', data: {
            file
        }
    });

})

router.get('/print-invoice', async (req, res, next) => {

    const { file } = req.query;

    res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
        fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
    });
})

module.exports = router;