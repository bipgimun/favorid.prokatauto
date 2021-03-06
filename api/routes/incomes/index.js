const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');

const Joi = require('joi');
const moment = require('moment');

const incomePrint = require('../../../libs/income-print');

const addScheme = Joi.object({
    date: Joi.date().iso().required(),
    base_id: Joi.string(),
    driver_id: Joi.number().default(null),
    supplier_id: Joi.number().default(null),
    base_other: Joi.string(),
    sum: Joi.number().required(),
    cash_storage_id: Joi.number().integer().required(),
    customer_id: Joi.number(),
    comment: Joi.string().allow('')
}).xor('base_id', 'base_other');

const updateScheme = Joi.object({
    date: Joi.date().iso().empty([null, '']),
    cash_storage_id: Joi.number().integer().empty([null, '']),
    sum: Joi.number().empty([null, '']),
    driver_id: Joi.number().empty('').default(null),
    supplier_id: Joi.number().empty('').default(null),
    comment: Joi.string().allow(''),
    customer_id: Joi.number(),
    id: Joi.number().required()
}).or('date', 'cash_storage_id', 'sum', 'comment');

const {
    invoicesModel,
    customersModel,
} = require('../../../models');

app.post('/add', async (req, res, next) => {

    const { values } = req.body;

    const validValues = await Joi.validate(values, addScheme);

    const { base_id: baseId } = validValues;

    if (baseId) {
        if (/^([\w]+)-([\d]+)$/i.test(baseId)) {
            const [, code = '', document_id = ''] = /^([\w]+)-([\d]+)$/i.exec(validValues.base_id) || [];

            validValues.code = code;
            validValues.document_id = document_id;
        } else if (/^([\w]+-[\w]+)-([\d]+)$/i.test(baseId)) {
            const [, code = '', document_id = ''] = /^([\w]+-[\w]+)-([\d]+)$/i.exec(validValues.base_id) || [];

            validValues.code = code;
            validValues.document_id = document_id;
        } else if (/^(\w{1,2})-([\d]+)$/i.test(baseId)) {
            const [, code = '', document_id = ''] = /^(\w{1,2})-([\d]+)$/i.exec(validValues.base_id) || [];

            validValues.code = code;
            validValues.document_id = document_id;
        } else {
            throw new Error('???????????????? ?????? ??????????????????');
        }
    }

    if(validValues.code && validValues.code.toLowerCase() == 'pd') {
        const [invoice] = await db.execQuery('SELECT * FROM invoices WHERE id = ?', [validValues.document_id]);

        if(!invoice) {
            throw new Error('???????? ???? ????????????');
        }
        
        // ?????????????????????? ???? ????????
        if(invoice.code.toUpperCase() == 'DET-A') {
            const [carDetailing] = await db.execQuery(`SELECT * FROM detailing_cars WHERE id = ?`, [invoice.base_id]);

            if(!carDetailing) {
                throw new Error('?????????????????????? ???????? ???? ??????????????');
            }

            if(+validValues.sum < +carDetailing.sum) {
                throw new Error('?????????? ?????????????? ???? ?????????? ???????? ???????????? ?????????? ??????????????????????, ???? ?????????????? ?????????????????? ????????');
            }
        } 
        // ?????????????????????? ??????????????
        else if(invoice.code.toUpperCase() == 'DET-K') {
            const [apartmentDetailing] = await db.execQuery(`SELECT * FROM detailing_apartments WHERE id = ?`, [invoice.base_id]);

            if(!apartmentDetailing) {
                throw new Error('?????????????????????? ?????????????? ???? ??????????????');
            }

            if(+validValues.sum < +apartmentDetailing.sum) {
                throw new Error('?????????? ?????????????? ???? ?????????? ???????? ???????????? ?????????? ??????????????????????');
            }
        }
    }

    validValues.manager_id = req.session.user.employee_id;

    const id = await db.insertQuery('INSERT INTO incomes SET ?', validValues);


    if (baseId && validValues.code === 'pd') {
        const invoicePayments = await db.execQuery(`SELECT * FROM incomes WHERE code = ? AND document_id = ?`, ['pd', validValues.document_id]);
        const [invoice = {}] = await invoicesModel.get({ id: validValues.document_id });

        const invoicePaymentsSum = invoicePayments
            .map(item => item.sum)
            .reduce((acc, sum) => +acc + +sum, 0);

        if (invoicePaymentsSum >= +invoice.sum) {
            await invoicesModel.update({ id: validValues.document_id, closed: new Date() });
        }
    }

    validValues.id = id;
    validValues.base = validValues.base_id || validValues.base_other;
    validValues.date = moment(validValues.date).format('DD.MM.YYYY');

    const [income] = await db.execQuery(`
        SELECT i.*,
            c.name as customer_name,
            s.name as supplier_name,
            d.name as driver_name,
            cs.name as cashbox_name
        FROM incomes i
            LEFT JOIN customers c ON c.id = i.customer_id
            LEFT JOIN cash_storages cs ON cs.id = i.cash_storage_id
            LEFT JOIN suppliers s ON s.id = i.supplier_id
            LEFT JOIN drivers d ON d.id = i.driver_id
        WHERE i.id = ${id}
    `);

    income.base = income.base_id || income.base_other;
    income.date = moment(income.date).format('DD.MM.YYYY');
    income.from = income.customer_name || income.supplier_name || income.driver_name;

    res.json({
        status: 'ok', data: income
    });
})

app.post('/getDocuments', async (req, res, next) => {

    const { customerId } = req.body;

    if (!customerId)
        throw new Error('?????????????????????? ????????????????');

    const carReservations = (await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations WHERE customer_id = ?`, [customerId]))
        .map(value => ({ id: value.code, text: value.code }));

    const apartmentReservations = (await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations WHERE customer_id = ?`, [customerId]))
        .map(value => ({ id: value.code, text: value.code }));

    const invoices = (await invoicesModel.get({ isPaid: false, customerId }))
        .map(item => ({ id: 'pd-' + item.id, text: 'pd-' + item.id }));

    const contracts = (await db.execQuery(`SELECT * FROM muz_contracts WHERE customer_id = ?`, [customerId]))
        .map(item => ({ id: 'muz-' + item.id, text: 'muz-' + item.id }));

    const groupDocuments = [
        { text: '???????????? ??????????????????????', children: carReservations, },
        { text: '???????????? ??????????????', children: apartmentReservations, },
        { text: '?????????? ?????? ????????????', children: invoices, },
        { text: '??????????????????', children: contracts },
    ];

    res.json({
        status: 'ok',
        body: groupDocuments
    });
})

app.post('/getDocumentsBySupplier', async (req, res, next) => {

    const { supplierId } = req.body;

    if (!supplierId)
        throw new Error('?????????????????????? ??????????????????');

    const suppliersDeals = (await db.execQuery(`SELECT * FROM suppliers_deals WHERE supplier_id = ?`, [supplierId]))
        .map(item => ({ id: 'SD-' + item.id, text: 'SD-' + item.id }));

    const groupDocuments = [
        { text: '???????????? ?? ????????????????????????', children: suppliersDeals, },
    ];

    res.json({
        status: 'ok',
        body: groupDocuments
    });
})

app.post('/getDocumentsByDriver', async (req, res, next) => {

    const { driverId } = req.body;

    if (!driverId)
        throw new Error('?????????????????????? ??????????????????');

    const carReservations = (await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations WHERE driver_id = ?`, [driverId]))
        .map(value => ({ id: value.code, text: value.code }));

    const driverShifts = (await db.execQuery(`
        SELECT d2s.*,
            s2c.contract_id
        FROM drivers2shifts d2s
            LEFT JOIN shifts2contracts s2c ON s2c.id = d2s.shift_id
        WHERE d2s.driver_id = ?
        `, [driverId]
    ));

    const driverContractsIds = [...new Set(driverShifts.map(item => item.contract_id))].join(',');
    const contractsQuery = await db.execQuery(`SELECT * FROM muz_contracts WHERE id IN (${driverContractsIds})`);

    const contracts = contractsQuery.map(item => ({ id: 'muz-' + item.id, text: 'muz-' + item.id }));

    const groupDocuments = [
        { text: '???????????? ??????????????????????', children: carReservations, },
        { text: '????????????????', children: contracts, },
    ];

    res.json({
        status: 'ok',
        body: groupDocuments
    });
})

app.post('/update', async (req, res, next) => {

    const { values } = req.body;

    const { id, ...validValues } = await Joi.validate(values, updateScheme);

    await db.insertQuery('UPDATE incomes SET ? WHERE id = ?', [validValues, id]);

    const [income = {}] = await db.execQuery(`
       SELECT i.*,
            cs.name as cashbox_name,
            cust.name as customer_name
        FROM incomes i
            LEFT JOIN cash_storages cs ON cs.id = i.cash_storage_id 
            LEFT JOIN customers cust ON cust.id = i.customer_id
        WHERE i.id = ?
    `, [id]);

    const returnValues = { validValues, ...income };

    returnValues.date = moment(returnValues.date).format('DD.MM.YYYY');

    res.json({
        status: 'ok', data: returnValues
    });
})

app.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('?????????????????????? ?????????? ??????????????');

    const [removedIncome = {}] = await db.execQuery(`SELECT * FROM incomes WHERE id = ?`, [id]);

    if (!removedIncome.id)
        throw new Error('???????????? ???? ??????????????');

    const { code, document_id } = removedIncome;

    if (code === 'pd') {

        const invoicePayments = await db.execQuery(`SELECT * FROM incomes WHERE code = ? AND document_id = ?`, [code, document_id]);
        const invoicePaymentsSum = invoicePayments
            .map(item => +item.sum)
            .reduce((acc, sum) => +acc + +sum, 0);

        const newPaymentSum = invoicePaymentsSum - removedIncome.sum;

        if (newPaymentSum < removedIncome.sum) {
            await invoicesModel.update({ id: document_id, closed: null });
        }
    }

    await db.execQuery('DELETE FROM incomes WHERE id = ?', [id]);

    res.json({
        status: 'ok',
    });
})

app.get('/print/:incomeId', async (req, res, next) => {

    const [income = {}] = await db.execQuery(`SELECT * FROM incomes WHERE id = ?`, [req.params.incomeId]);

    if (!income.id) {
        throw new Error('???????????? ???? ????????????');
    }

    let from = '';

    if(income.customer_id) {
        const [customer = {}] = await customersModel.get({ id: income.customer_id });
    
        if (!customer.id) {
            throw new Error('???????????????? ???? ????????????');
        }

        from = customer.is_legal_entity ? '????. ????????' : '??????. ????????';
    } else if(income.driver_id) {
        const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [income.driver_id]);

        if(!driver) {
            throw new Error('???????????????? ???? ????????????');
        }

        from = driver.name;
    } else if(income.supplier_id) {
        const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [income.supplier_id]);

        if(!supplier) {
            throw new Error('?????????????????? ???? ????????????');
        }

        from = supplier.name;
    } else {
        throw new Error('?????????????????????? ?????????????????????? ???????????????? ??????????????');
    }


    let base;

    if (income.code == 'pd') {
        const [o] = await db.execQuery('SELECT * FROM invoices WHERE id = ?', [income.document_id]);
        base = `???????? ?????? ???????????? ??? ${o.id} ???? ${moment(o.created).format('DD.MM.YYYY')}`;
    } else if (income.code == 'CRR') {
        const [o] = await db.execQuery('SELECT * FROM cars_reservations WHERE id = ?', [income.document_id]);
        base = `???????????? ???? ???????????? ???????? ??? ${o.id} ???? ${moment(o.rent_start).format('DD.MM.YYYY')}`;
    } else if (income.code == 'APR') {
        const [o] = await db.execQuery('SELECT * FROM apartment_reservations WHERE id = ?', [income.document_id]);
        base = `???????????? ???? ???????????? ???????????????? ??? ${o.id} ???? ${moment(o.entry).format('DD.MM.YYYY')}`;
    } else {
        throw new Error('???????????????? ??????????????????');
    }

    const file = await incomePrint({
        base,
        id: income.id,
        created: income.created,
        sum: income.sum,
        takeFrom: from
    });

    res.download(file);
})

module.exports = app;