const express = require('express');
const app = express();

const checkAuth = require('../libs/middlewares/check-auth');

app.post('/login', require('./routes/login'));

function checkPrivileges(req, res, next) {

    const url = req.url;

    const privileges = {
        can_edit: req.session.user.is_director == '1' || req.session.user.is_senior_manager == '1',
        can_remove: req.session.user.is_director == '1'
    };

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

    next();
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
app.use('/act-sverki-suppliers', checkAuth, checkPrivileges, require('./routes/act-sverki-suppliers'));

app.use('/employees', checkAuth, checkPrivileges, require('./routes/employees'));
app.use('/balance', checkAuth, checkPrivileges, require('./routes/balance'));
app.use('/suppliers', checkAuth, checkPrivileges, require('./routes/suppliers'));
app.use('/suppliers-deals', checkAuth, checkPrivileges, require('./routes/suppliers-deals'));
app.use('/suppliers-positions', checkAuth, checkPrivileges, require('./routes/suppliers-positions'));

app.use((req, res, next) => res.status(404).json({ status: 'bad', message: 'Страница не найдена' }));

app.use((error, req, res, next) => {
    console.error('[' + new Date().toLocaleString() + ']:', error);

    if (req.method !== 'POST')
        return next(error);


    return res.json({ status: 'bad', message: error.message, stack: error.stack });
})

module.exports = app;