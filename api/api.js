const express = require('express');
const app = express();

const checkAuth = require('../libs/middlewares/check-auth');

const db = require('../libs/db');

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

    await db.insertQuery(`INSERT INTO cars SET ?`, values);

    res.json({ status: 'ok', data: req.body });
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

    await db.insertQuery(`INSERT INTO customers SET ?`, values);

    res.json({ status: 'ok', data: req.body });
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

    await db.insertQuery(`INSERT INTO passengers SET ?`, values);

    res.json({ status: 'ok', data: req.body });
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

    await db.insertQuery(`INSERT INTO drivers SET ?`, values);

    res.json({ status: 'ok', data: req.body });
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

    await db.insertQuery(`INSERT INTO itineraries SET ?`, values);

    res.json({ status: 'ok', data: req.body });
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

    await db.insertQuery(`INSERT INTO cash_storages SET ?`, values);

    res.json({ status: 'ok', data: req.body });
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

    await db.insertQuery(`INSERT INTO additional_services SET ?`, values);

    res.json({ status: 'ok', data: req.body });
})

app.use((req, res, next) => next(new Error('Страница не найдена')));

app.use((error, req, res, next) => {
    console.error(error);

    if (req.method !== 'POST')
        return next(error);


    return res.json({ status: 'bad', message: error.message, stack: error.stack });
})

module.exports = app;