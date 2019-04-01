const express = require('express');
const app = express();

const checkAuth = require('../libs/middlewares/check-auth');

const db = require('../libs/db');
const { wishList } = require('./wish-list');
const messages = require('./messages');

const moment = require('moment');
const apartments_statuses = require('../config/apartment-statuses');

app.post('/login', require('./routes/login'));

app.post('/salesServices/add', checkAuth, require('./routes/sales-services/add'));
app.post('/salesGoods/add', checkAuth, require('./routes/sales-goods/add'));
app.post('/costs/add', checkAuth, require('./routes/costs/add'));
app.post('/income/add', checkAuth, require('./routes/incomes/add'));
app.post('/comingGoods/add', checkAuth, require('./routes/coming-goods/add'));
app.post('/cashbox/loadData', checkAuth, require('./routes/cashbox/loadData'));
app.post('/goods/getInfo', checkAuth, require('./routes/goods/getInfo'));
app.post('/report/getTable', checkAuth, require('./routes/report/getTable'))
app.post('/salaryStatement/getTable', checkAuth, require('./routes/salary-statement/getTable'));
app.post('/analytics/loadCharts', checkAuth, require('./routes/analytics/loadCharts'));
app.post('/salesReport/loadGoodsTable', checkAuth, require('./routes/sales-reports/load-goods-table'));
app.post('/salesReport/loadServicesTable', checkAuth, require('./routes/sales-reports/load-services-table'));
app.post('/remnants-of-goods/loadTableOborotGoods', checkAuth, require('./routes/remnants-of-goods/loadTableOborotGoods'));
app.post('/nomenclature/addProduct', checkAuth, require('./routes/nomenclature/addProduct'));
app.post('/nomenclature/addService', checkAuth, require('./routes/nomenclature/addService'));

app.post('/cars/add', checkAuth, async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const id = await db.insertQuery(`INSERT INTO cars SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/cars/update', checkAuth, async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.cars.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE cars SET ? WHERE id = ?`, [validValues, id]);

    if (validValues.in_leasing) {
        if (validValues.in_leasing === '1') {
            validValues.in_leasing = 'Лизинг';
        } else {
            validValues.in_leasing = 'Не лизинг';
        }
    }

    if (validValues.release_date) {
        validValues.release_date = moment(validValues.release_date).format('DD.MM.YYYY');
    }

    if (validValues.osago_expiration_date) {
        validValues.osago_expiration_date = moment(validValues.osago_expiration_date).format('DD.MM.YYYY');
    }

    if (validValues.payment_date) {
        validValues.payment_date = moment(validValues.payment_date).format('DD.MM.YYYY');
    }

    if (validValues.leasing_expiration_date) {
        validValues.leasing_expiration_date = moment(validValues.leasing_expiration_date).format('DD.MM.YYYY');
    }

    res.json({ status: 'ok', data: validValues });
})

app.post('/customers/get', checkAuth, async (req, res, next) => {

    const customers = await db.execQuery(`SELECT * FROM customers`);

    res.json({ status: 'ok', customers });
})

app.post('/customers/getOne', checkAuth, async (req, res, next) => {

    const { id = '' } = req.body;

    if (!id)
        throw new Error(messages.missingId);

    const [customer = {}] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [id]);

    res.json({ status: 'ok', data: customer });
})

app.post('/clients/get', checkAuth, async (req, res, next) => {

    const clients = await db.execQuery(`SELECT * FROM passengers`);

    res.json({ status: 'ok', clients });
})

app.post('/clients/getOne', checkAuth, async (req, res, next) => {

    const { id = '' } = req.body;

    if (!id)
        throw new Error(messages.missingId);

    const [client = {}] = await db.execQuery(`SELECT * FROM passengers WHERE id = ?`, [id]);

    res.json({ status: 'ok', client });
})

app.post('/apartments/get', checkAuth, async (req, res, next) => {

    const apartments = await db.execQuery(`SELECT * FROM apartments`);

    res.json({ status: 'ok', apartments });
})

app.post('/apartments/getOne', checkAuth, async (req, res, next) => {

    const { id = '' } = req.body;

    if (!id)
        throw new Error(messages.missingId);


    const [apartment = {}] = await db.execQuery(`SELECT * FROM apartments WHERE id = ?`, [id]);

    res.json({ status: 'ok', apartment });
})

app.post('/cashStorages/get', checkAuth, async (req, res, next) => {

    const storages = await db.execQuery(`SELECT * FROM cash_storages`);

    res.json({ status: 'ok', items: storages });
})

app.post('/additionalServices/get', checkAuth, async (req, res, next) => {

    const services = await db.execQuery(`SELECT * FROM additional_services`);

    res.json({ status: 'ok', items: services });
})

app.post('/customers/add', checkAuth, async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const id = await db.insertQuery(`INSERT INTO customers SET ?`, values);

    values.id = id;
    values.is_legal_entity = values.is_legal_entity == '1' ? 'Юридическре лицо' : 'Физ. лицо'

    res.json({ status: 'ok', data: values });
})

app.post('/customers/update', checkAuth, async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.customers.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE customers SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/passengers/add', checkAuth, async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const id = await db.insertQuery(`INSERT INTO passengers SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/passengers/update', checkAuth, async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.passengers.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE passengers SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/drivers/add', checkAuth, async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const id = await db.insertQuery(`INSERT INTO drivers SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/drivers/update', checkAuth, async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.drivers.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE drivers SET ? WHERE id = ?`, [validValues, id]);

    if (validValues.birthday) {
        validValues.birthday = moment(validValues.birthday).format('DD.MM.YYYY');
    }

    if (validValues.license_date_issue) {
        validValues.license_date_issue = moment(validValues.license_date_issue).format('DD.MM.YYYY');
    }

    if (validValues.license_date_expiration) {
        validValues.license_date_expiration = moment(validValues.license_date_expiration).format('DD.MM.YYYY');
    }

    if (validValues.passport_date_issue) {
        validValues.passport_date_issue = moment(validValues.passport_date_issue).format('DD.MM.YYYY');
    }

    if (validValues.car_id) {
        const [car = {}] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [validValues.car_id]);
        validValues.car_name = `${car.name} ${car.model}`;
    }

    res.json({ status: 'ok', data: validValues });
})

app.post('/itineraries/add', checkAuth, async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const id = await db.insertQuery(`INSERT INTO itineraries SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/itineraries/update', checkAuth, async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.itineraries.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE itineraries SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/cashStorages/add', checkAuth, async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const id = await db.insertQuery(`INSERT INTO cash_storages SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/cashStorages/update', checkAuth, async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.cashStorages.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE cash_storages SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/additionalServices/add', checkAuth, async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const id = await db.insertQuery(`INSERT INTO additional_services SET ?`, values);

    values.id = id;

    res.json({ status: 'ok', data: values });
})

app.post('/additionalServices/update', checkAuth, async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.additionalServices.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE additional_services SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/apartments/add', checkAuth, async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const id = await db.insertQuery(`INSERT INTO apartments SET ?`, values);

    const [apartment = {}] = await db.execQuery(`SELECT * FROM apartments WHERE id = ?`, [id]);

    apartment.statusName = apartments_statuses.get(0);

    res.json({ status: 'ok', data: apartment });
})

app.post('/apartments/update', checkAuth, async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.apartments.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE apartments SET ? WHERE id = ?`, [validValues, id]);

    res.json({ status: 'ok', data: validValues });
})

app.post('/apartmentReservations/add', checkAuth, async (req, res, next) => {

    const { values } = req.body;
    const errors = [];

    Object.keys(values).forEach(key => {
        const value = values[key];

        if (!value)
            errors.push(`Missing "${key}" value`);
    })

    if (errors.length)
        throw new Error('Заполнены не все поля');

    const { apartment_id: apId } = values;

    const apInWorks = await db.execQuery('SELECT * FROM apartment_reservations WHERE apartment_id = ? AND status NOT IN (0, 3)', [apId]);

    if (apInWorks.length > 0)
        throw new Error('Данная квартира уже находится в работе');

    const id = await db.insertQuery(`INSERT INTO apartment_reservations SET ?`, values);

    const [ap = {}] = await db.execQuery(`
        SELECT ar.*,
            a.address,
            p.name as client_name
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
        WHERE ar.id = ?`, [id]
    );

    ap.statusName = apartments_statuses.get(0);
    ap.created_at = moment(ap.created_at).format('DD.MM.YYYY');

    res.json({ status: 'ok', data: ap });
})

app.post('/apartmentReservations/update', checkAuth, async (req, res, next) => {

    const { id, ...fields } = req.body.values;

    const validValues = Object.keys(fields)
        .filter(field => wishList.apartmentReservations.includes(field))
        .reduce((acc, item) => (acc[item] = fields[item], acc), {});

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE apartment_reservations SET ? WHERE id = ?`, [validValues, id]);

    if (typeof validValues.status !== 'undefined') {
        validValues.status_name = apartments_statuses.get(+validValues.status);
    }

    if (validValues.entry) {
        validValues.entry = moment(validValues.entry).format('DD.MM.YYYY в HH:mm');
    }

    if (validValues.departure) {
        validValues.departure = moment(validValues.departure).format('DD.MM.YYYY в HH:mm');
    }

    res.json({ status: 'ok', data: validValues });
})

app.use((req, res, next) => next(new Error('Страница не найдена')));

app.use((error, req, res, next) => {
    console.error('[' + new Date().toLocaleString() + ']:', error);

    if (req.method !== 'POST')
        return next(error);


    return res.json({ status: 'bad', message: error.message, stack: error.stack });
})

module.exports = app;