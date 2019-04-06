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

app.use('/cars', checkAuth, require('./routes/cars'));
app.use('/priceList', checkAuth, require('./routes/cars-price'));
app.use('/customers', checkAuth, require('./routes/customers'));
app.use('/clients', checkAuth, require('./routes/clients'));
app.use('/apartments', checkAuth, require('./routes/apartments'));
app.use('/cashStorages', checkAuth, require('./routes/cash-storages'));
app.use('/additionalServices', checkAuth, require('./routes/additional-services'));
app.use('/drivers', checkAuth, require('./routes/drivers'));
app.use('/itineraries', checkAuth, require('./routes/itineraries'));
app.use('/apartmentReservations', checkAuth, require('./routes/apartment-reservations'));


app.use((req, res, next) => next(new Error('Страница не найдена')));

app.use((error, req, res, next) => {
    console.error('[' + new Date().toLocaleString() + ']:', error);

    if (req.method !== 'POST')
        return next(error);


    return res.json({ status: 'bad', message: error.message, stack: error.stack });
})

module.exports = app;