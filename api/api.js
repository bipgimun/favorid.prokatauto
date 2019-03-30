const express = require('express');
const app = express();

const checkAuth = require('../libs/middlewares/check-auth');

const db = require('../libs/db');
const { wishList } = require('./wish-list');
const messages = require('./messages');

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

    res.json({ status: 'ok' });
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

    res.json({ status: 'ok' });
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

    res.json({ status: 'ok' });
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

    res.json({ status: 'ok' });
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

    res.json({ status: 'ok' });
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

    res.json({ status: 'ok' });
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

    res.json({ status: 'ok' });
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

    await db.insertQuery(`INSERT INTO apartments SET ?`, values);

    res.json({ status: 'ok', data: req.body });
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

    res.json({ status: 'ok' });
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

    await db.insertQuery(`INSERT INTO apartment_reservations SET ?`, values);

    res.json({ status: 'ok', data: req.body });
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

    res.json({ status: 'ok' });
})

app.use((req, res, next) => next(new Error('Страница не найдена')));

app.use((error, req, res, next) => {
    console.error('[' + new Date().toLocaleString() + ']:', error);

    if (req.method !== 'POST')
        return next(error);


    return res.json({ status: 'bad', message: error.message, stack: error.stack });
})

module.exports = app;