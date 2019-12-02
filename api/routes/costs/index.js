const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const safeStr = require('../../../libs/safe-string');
const messages = require('../../messages');

const { wishList } = require('../../wish-list');

const Joi = require('joi');
const moment = require('moment');

const costsPrint = require('../../../libs/cost-print');

const addScheme = Joi.object({
    base_id: Joi.string().empty(''),
    driver_id: Joi.string().empty(''),
    supplier_id: Joi.string().empty(''),
    customer_id: Joi.number().empty(''),
    base_other: Joi.string().empty(''),
    sum: Joi.number().required(),
    cash_storage_id: Joi.number().integer().required(),
    category_id: Joi.number().integer().required(),
    comment: Joi.string().empty(''),
    date: Joi.date().iso().required(),
}).xor('base_id', 'base_other', 'driver_id', 'supplier_id', 'customer_id');

const updateScheme = Joi.object({
    date: Joi.date().iso().empty([null, '']),
    category_id: Joi.number().integer().empty([null, '']),
    customer_id: Joi.number().empty('').default(null),
    cash_storage_id: Joi.number().integer().empty([null, '']),
    sum: Joi.number().empty([null, '']),
    comment: Joi.string().allow(''),
    id: Joi.number().required()
}).or('date', 'cash_storage_id', 'sum', 'comment');

const {
    costsCategories: costsCategoriesModel,
    suppliersDealsModel,
    customersModel
} = require('../../../models');

app.post('/add', async (req, res, next) => {

    const { values, details = '' } = req.body;

    const validValues = await Joi.validate(values, addScheme);

    if (validValues.base_id) {
        const [, code = '', document_id = ''] = /([\w]+)-([\d]+)/.exec(validValues.base_id) || [];

        validValues.code = code;
        validValues.document_id = document_id;
    }


    const jsonDetails = JSON.parse(details);


    validValues.manager_id = req.session.user.employee_id;

    const id = await db.insertQuery('INSERT INTO costs SET ?', [validValues]);

    for (const key of Object.keys(jsonDetails)) {
        const detail = jsonDetails[key] || [];

        if (detail.length < 1) {
            continue;
        }

        for (const detItem of detail) {
            const { target_id, price } = detItem;
            await db.insertQuery(`INSERT INTO costs_details SET ?`, [{ cost_id: id, target_type: key, target_id, price }]);
        }
    }

    validValues.id = id;
    validValues.base = validValues.base_id || validValues.base_other;
    validValues.date = moment(validValues.date).format('DD.MM.YYYY');

    validValues.category = (await costsCategoriesModel.get({ id: validValues.category_id }))
        .reduce((acc, item) => item.title, '');

    /** если расход по сделке, и сумма расходов превышаем сумму сделки, то обновить сделку */
    if (validValues.code == 'SD') {

        const [deal] = await suppliersDealsModel.get({ id: validValues.document_id });

        const costsByDeal = await db.execQuery(`SELECT sum FROM costs WHERE code = ? AND document_id = ?`, ['SD', deal.id]);
        const costsSum = costsByDeal.reduce((acc, value) => +acc + +value.sum, 0);

        const remainder = (deal.sum - costsSum);

        if (remainder <= 0) {
            await suppliersDealsModel.update({ id: validValues.document_id, values: { is_paid: true, paid_at: new Date() } });
        }
    }

    const [cost] = await db.execQuery(`
        SELECT c.*,
            cc.title as category,
            s.name as supplier_name,
            d.name as driver_name,
            cs.name as cashbox_name
        FROM costs c
            LEFT JOIN costs_categories cc ON cc.id = c.category_id
            LEFT JOIN suppliers s ON s.id = c.supplier_id
            LEFT JOIN drivers d ON d.id = c.driver_id
            LEFT JOIN cash_storages cs ON cs.id = c.cash_storage_id
        WHERE c.id = ${id}
    `);

    cost.base = cost.base_id || cost.base_other;
    cost.date = moment(cost.date).format('DD.MM.YYYY');

    const cost2 = await getCostDirection(cost);

    res.json({
        status: 'ok', data: cost2
    });
})

async function getCostDirection(cost) {
    const { code, document_id: documentId } = cost;

    let toCost = '';

    if (code === 'CRR') {
        const [CRR] = await db.execQuery(`SELECT * FROM cars_reservations WHERE id = ?`, [documentId]);

        if (!CRR)
            toCost = '';

        const [customer] = await customersModel.get({ id: CRR.customer_id });

        if (!customer)
            toCost = '';

        toCost = customer.name;
    } else if (code === 'APR') {
        const [APR] = await db.execQuery(`SELECT * FROM apartment_reservations WHERE id = ?`, [documentId]);

        if (!APR)
            toCost = '';

        const [customer] = await customersModel.get({ id: APR.customer_id });

        if (!customer)
            toCost = '';

        toCost = customer.name;
    } else if (code === 'MUZ') {
        const [MUZ] = await db.execQuery(`SELECT * FROM muz_contracts WHERE id = ?`, [documentId]);

        if (!MUZ)
            toCost = '';

        const [customer] = await customersModel.get({ id: MUZ.customer_id });

        if (!customer)
            toCost = '';

        toCost = customer.name;
    } else if (code === 'CAR') {
        const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [documentId]);

        if (!car)
            toCost = '';

        toCost = `${car.name} ${car.model} - ${car.number}`;
    } else if (code === 'SD') {
        const [supplierDeal] = await db.execQuery(`SELECT * FROM suppliers_deals WHERE id = ?`, [documentId]);

        if (!supplierDeal)
            toCost = '';

        const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [documentId]);

        if (!supplier)
            toCost = '';

        toCost = supplier.name;
    }


    if (cost.supplier_id) {
        const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [cost.supplier_id]);

        if (!supplier)
            toCost = '';

        toCost = supplier.name;
    }

    if (cost.driver_id) {
        const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [cost.driver_id]);

        if (!driver)
            toCost = '';

        toCost = driver.name;
    }

    if (cost.customer_id) {
        const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [cost.customer_id]);

        if (!customer)
            toCost = '';

        toCost = customer.name;
    }

    cost.toCost = toCost;
    return cost;
}

app.post('/update', async (req, res, next) => {

    const { values } = req.body;

    const { id, ...validValues } = await Joi.validate(values, updateScheme);

    await db.insertQuery('UPDATE costs SET ? WHERE id = ?', [validValues, id]);

    const [cost = {}] = await db.execQuery(`
        SELECT c.*,
            cc.title as category,
            cs.name as cashbox_name
        FROM costs c
            LEFT JOIN costs_categories cc ON cc.id = c.category_id
            JOIN cash_storages cs ON cs.id = c.cash_storage_id
        WHERE c.id = ?
    `, [id]);

    const returnValues = { validValues, ...cost };

    returnValues.date = moment(returnValues.date).format('DD.MM.YYYY');

    res.json({
        status: 'ok', data: returnValues
    });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('Отсутствует номер расхода');

    await db.execQuery('DELETE FROM costs WHERE id = ?', [id]);

    res.json({
        status: 'ok',
    });
})

app.get('/downloadPrint/:costsId', async (req, res, next) => {

    const [costs = {}] = await db.execQuery('SELECT * FROM costs WHERE id = ?', [req.params.costsId]);

    if (!costs.id) {
        throw new Error('Расходник не найден')
    }

    let base;

    if (costs.driver_id) {
        const [o] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [costs.driver_id]);
        base = o.name;
    } else if (costs.supplier_id) {
        const [o] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [costs.supplier_id]);
        base = o.name;
    } else if (costs.base_other) {
        base = costs.base_other;
    } else if (costs.code == 'APR') {
        const [o] = await db.execQuery(`SELECT * FROM apartment_reservations WHERE id = ?`, [costs.document_id]);
        base = `Аренда квартиры № ${o.id} от ${moment(o.entyu).format('DD.MM.YYYY')}`;
    } else if (costs.code == 'CRR') {
        const [o] = await db.execQuery(`SELECT * FROM cars_reservations WHERE id = ?`, [costs.document_id]);
        base = `Аренда автомобиля № ${o.id} от ${moment(o.rent_start).format('DD.MM.YYYY')}`;
    } else if (costs.code == 'CAR') {
        const [o] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [costs.document_id]);
        base = `${o.name} ${o.model} ${o.number}`;
    } else if (costs.code == 'SD') {
        const [o] = await suppliersDealsModel.get({ id: costs.document_id });
        base = `Сделка с поставщиком ${o.supplier_name} от ${moment(o.created_at).format('DD.MM.YYYY')}`;
    } else if (costs.code == 'MUZ') {
        const [o] = await db.execQuery(`SELECT * FROM muz_contracts WHERE id = ?`, [costs.document_id]);
        base = `Контракт № ${o.id} от ${moment(o.date_start).format('DD.MM.YYYY')}`;
    }
    else {
        throw new Error('Неизвестный код основания');
    }

    const file = await costsPrint({ id: costs.id, sum: +costs.sum, created: costs.date, base });
    res.download(file);
})

module.exports = app;