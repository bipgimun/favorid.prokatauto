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
const db = require('../../../libs/db')

const {
    invoicesModel,
    detailingApartmentsModel,
    detailingCarsModel,
    detailingApartmentsDetailsModel,
    detailingCarsDetailsModel,
    apartmentsReservsModel,
    carsReservsModel,
    customersModel,
} = require('../../../models');

const addSchema = Joi.object({
    code: Joi.string().required(),
    sum: Joi.number().min(0).required()
});

router.post('/get', async (req, res, next) => {
    res.json({ status: 'ok', body: [] });
});

router.post('/get/code/:code', async (req, res, next) => {


    const { code } = req.params;

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

    res.json({ status: 'ok', body: result });
})

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

    const results = [];
    let resTitle = '';

    if (detailCode === 'DET-A') {
        const details = await detailingCarsDetailsModel.get({ detailing_id: base_id });

        resTitle = 'Заявка на авто';

        for (const detail of details) {
            const [item = {}] = await carsReservsModel.get({ id: detail.reserv_id });

            item.desc = `${resTitle} ${item.has_driver == '1' ? `с водителем` : `без водителя`} №${item.id} от ${moment(item.rent_start).format('DD.MM.YYYY')}`;

            results.push(item);
        }

    } else if (detailCode === 'DET-K') {

        const details = await detailingApartmentsDetailsModel.get({ detailing_id: base_id });

        resTitle = 'Заявка на квартиру';

        for (const detail of details) {
            const [item = {}] = await apartmentsReservsModel.get({ id: detail.reserv_id });

            item.desc = `${resTitle} №${item.id} от ${moment(item.entry).format('DD.MM.YYYY')}`;

            results.push(item);
        }
    } else if (detailCode === 'CRR') {
        const [item = {}] = await carsReservsModel.get({ id: base_id });

        resTitle = 'Заявка на авто';
        item.desc = `${resTitle} ${item.has_driver == '1' ? `с водителем` : `без водителя`} №${item.id} от ${moment(item.rent_start).format('DD.MM.YYYY')}`;

        results.push(item);
    } else if (detailCode === 'APR') {
        const [item = {}] = await apartmentsReservsModel.get({ id: base_id });

        resTitle = 'Заявка на квартиру';

        item.desc = `${resTitle} №${item.id} от ${moment(item.entry).format('DD.MM.YYYY')}`;

        results.push(item);
    } else {
        throw new Error('Неверный код основания');
    }


    const dataArray = results.map((item, index) => {
        return [+index + 1, item.desc, 1, '', +item.sum];
    });


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

router.post('/delete', async (req, res, next) => {
    const { id } = req.body;

    if (!id || !Number(id)) {
        throw new Error('Неверный id');
    }

    const payments = await db.execQuery(`SELECT * FROM incomes WHERE code = ? AND document_id = ?`, ['pd', id]);

    if (payments.length) {
        throw new Error('Невозможно удалить счёт, так как по нему имеются приходы');
    }

    await db.execQuery(`DELETE FROM invoices WHERE id = ?`, [id]);
    return res.json({ status: 'ok' });
})

module.exports = router;