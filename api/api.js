const express = require('express');
const app = express();

const checkAuth = require('../libs/middlewares/check-auth');

app.post('/login', require('./routes/login'));

// -------------OLD API------------------------------------
// app.post('/salesServices/add', checkAuth, require('./routes/sales-services/add'));
// app.post('/salesGoods/add', checkAuth, require('./routes/sales-goods/add'));
// app.post('/costs/add', checkAuth, require('./routes/costs/add'));
// app.post('/income/add', checkAuth, require('./routes/incomes/add'));
// app.post('/comingGoods/add', checkAuth, require('./routes/coming-goods/add'));
// app.post('/cashbox/loadData', checkAuth, require('./routes/cashbox/loadData'));
// app.post('/goods/getInfo', checkAuth, require('./routes/goods/getInfo'));
// app.post('/report/getTable', checkAuth, require('./routes/report/getTable'))
// app.post('/analytics/loadCharts', checkAuth, require('./routes/analytics/loadCharts'));
// app.post('/salesReport/loadGoodsTable', checkAuth, require('./routes/sales-reports/load-goods-table'));
// app.post('/salesReport/loadServicesTable', checkAuth, require('./routes/sales-reports/load-services-table'));
// app.post('/remnants-of-goods/loadTableOborotGoods', checkAuth, require('./routes/remnants-of-goods/loadTableOborotGoods'));
// app.post('/nomenclature/addProduct', checkAuth, require('./routes/nomenclature/addProduct'));
// app.post('/nomenclature/addService', checkAuth, require('./routes/nomenclature/addService'));
// ------------------------------------------------------------------------

function checkPrivileges(req, res, next) {
    
    const url = req.url;

    const privileges = {
        can_edit: req.session.user.is_director == '1' || req.session.user.is_senior_manager == '1',
        can_remove: req.session.user.is_director == '1'
    };

    console.log(url);
    console.log('url.search(/\/update/)', url.search(/\/update/));

    if (url.search(/\/update/) > -1) {
        if (privileges.can_edit) {
            return next();
        } else {
            throw new Error('Недостаточно прав для обновления');
        }
    }

    if (url.search(/\/delete|\/remove/) > -1) {
        if (privileges.can_remove) {
            return next();
        } else {
            throw new Error('Недостаточно прав для удаления');
        }
    }
}

app.use('/apartmentReservations', checkAuth, checkPrivileges, require('./routes/apartment-reservations'));
app.use('/carReservations', checkAuth, checkPrivileges, require('./routes/car-reservations'));

app.use('/cars', checkAuth, checkPrivileges, require('./routes/cars'));
app.use('/price-list', checkAuth, checkPrivileges, require('./routes/cars-price'));
app.use('/customers', checkAuth, checkPrivileges, require('./routes/customers'));
app.use('/clients', checkAuth, checkPrivileges, require('./routes/clients'));
app.use('/apartments', checkAuth, checkPrivileges, require('./routes/apartments'));
app.use('/cashStorages', checkAuth, checkPrivileges, require('./routes/cash-storages'));
app.use('/additionalServices', checkAuth, checkPrivileges, require('./routes/additional-services'));
app.use('/drivers', checkAuth, checkPrivileges, require('./routes/drivers'));
app.use('/itineraries', checkAuth, checkPrivileges, require('./routes/itineraries'));
app.use('/incomes', checkAuth, checkPrivileges, require('./routes/incomes'));
app.use('/costs', checkAuth, checkPrivileges, require('./routes/costs'));
app.use('/costs-categories', checkAuth, checkPrivileges, require('./routes/costs-categories'));

app.use('/detailing-cars', checkAuth, checkPrivileges, require('./routes/detailing-cars'));
app.use('/detailing-apartments', checkAuth, checkPrivileges, require('./routes/detailing-apartments'));
app.use('/invoices', checkAuth, checkPrivileges, require('./routes/invoices'));
app.use('/salaryStatement', checkAuth, checkPrivileges, require('./routes/salary-statement'));
app.use('/salary-reports', checkAuth, checkPrivileges, require('./routes/salary-reports'));
app.use('/act-sverki', checkAuth, checkPrivileges, require('./routes/act-sverki'));

app.use('/employees', checkAuth, checkPrivileges, require('./routes/employees'));


app.use((req, res, next) => next(new Error('Страница не найдена')));

app.use((error, req, res, next) => {
    console.error('[' + new Date().toLocaleString() + ']:', error);

    if (req.method !== 'POST')
        return next(error);


    return res.json({ status: 'bad', message: error.message, stack: error.stack });
})

module.exports = app;