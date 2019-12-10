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
app.use('/muz-contracts', checkAuth, checkPrivileges, require('./routes/muz-contracts'));

app.use('/contract-shifts', checkAuth, checkPrivileges, require('./routes/contracts-shifts'));
app.use('/drivers2shifts', checkAuth, checkPrivileges, require('./routes/drivers2shifts'));
app.use('/waybill-sheets', checkAuth, checkPrivileges, require('./routes/waybill-sheets'));

app.use('/flow-founds', checkAuth, require('./routes/flow-founds'));
app.use('/units-profitability', checkAuth, require('./routes/units-profitability'));
app.use('/projects-profitability', checkAuth, require('./routes/projects-profitability'));

app.use('/notifications', checkAuth, require('./routes/notifications'));

app.use((req, res, next) => res.status(404).json({ status: 'bad', message: 'Страница не найдена' }));

app.use((error, req, res, next) => {
    console.error('[' + new Date().toLocaleString() + ']:', error);

    let errorMessage = error.message;

    if (req.method !== 'POST')
        return next(error);

    if (error.isJoi) {
        const { details } = error;

        const message = details.map(i => {

            const { label } = i.context;

            if (i.type === 'any.required') {
                return `Поле ${label} является обязательным для заполнение`;
            } else if (i.type === 'any.empty') {
                return `Поле ${label} не должно быть пустым`;
            } else if (i.type === 'date.isoDate') {
                return `Поле ${label} имеет неверный формат даты`;
            } else if(i.type === 'boolean.base') {
                return `Поле ${label} должно быть типа логическим выражением`;
            } else if(i.type === 'date.base') {
                return `Поле ${label} должно быть типа датой`;
            } else if(i.type === 'number.base') {
                return `Поле ${label} должно быть числовым типом`;
            } else if(i.type === 'string.base') {
                return `Поле ${label} должно быть строковым типом`;
            }


            return i.message;

        }).join(',');

        errorMessage = message || errorMessage;
    }

    return res.json({ status: 'bad', message: errorMessage, stack: error.stack });
})

module.exports = app;