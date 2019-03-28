const cookieSession = require('cookie-session');
const hbs = require('express-handlebars');
const express = require('express');

const config = require('./config');

const app = express();

const db = require('./libs/db');

const moment = require('moment');

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
        inc: (value, options) => (parseInt(value) + 1),
        setActive: (url, test, options) => {
            return url == test ? 'nav-active' : ''
        },
        setOpen: (...values) => {
            const [url, ...whiteList] = values.slice(0, -1);
            return whiteList.includes(url) ? 'nav-expanded' : '';
        },
        round: (value) => {
            const round = Number(Number(value).toFixed(1));
            return isNaN(round) ? '' : round;
        },
        ifTrue: (condition, valueTrue, valueFalse) => {
            return !!condition ? valueTrue : false;
        },
        toIsoString(date) {
            return moment(date).format(moment.HTML5_FMT.DATETIME_LOCAL);
        }
    }
}));

app.set('view engine', 'hbs');

app.use(cookieSession({
    name: 'erp-session',
    keys: ['5y9OTcxe8u3W4drqTPg40StxutlYYzCn', 'BKB6jAqNavJ8JvBYJimS8YwJeeOX5IdC'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// serve static
app.use('/assets', express.static(__dirname + '/assets'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    req.session.user = req.session.user || {};
    next();
});

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
})

app.get(['/pages-signin', '/pages-signin.html'], require('./routes/login'));

// подключение api
app.use('/api', require('./api'));

// проверка авторизации
app.use(require('./libs/middlewares/check-auth'));

const index = require('./routes/home');
const sales = require('./routes/sales');
const commodityNomenclature = require('./routes/commodity-nomenclature');
const incomingGoods = require('./routes/incoming-goods');
const costsIncome = require('./routes/costs-income');
const remnantsOfGoods = require('./routes/remnants-of-goods');
const cashBox = require('./routes/cashbox');
const report = require('./routes/report');
const salaryStatement = require('./routes/salary-statement');

const checkParams = (paramName) => {
    return (req, res, next) => {
        const { [paramName]: param } = req.params;

        if (!param)
            throw new Error('Отсутствует id');

        if (!Number(param))
            throw new Error('Id type error');

        next();
    }
}

app.use((req, res, next) => {
    res.locals.reqUrl = req.url;
    next();
});

// объявление маршрутов приложения
app.get(['/', '/index.html'], index);
app.get(['/sales', '/sales.html'], sales);
app.get(['/cashbox', '/cashbox.html'], cashBox);
app.get(['/costs-income', '/costs-income.html'], costsIncome);
app.get(['/incoming-goods', '/incoming-goods.html'], incomingGoods);
app.get(['/remnants-of-goods', '/remnants-of-goods.html'], remnantsOfGoods);
app.get(['/commodity-nomenclature', '/commodity-nomenclature.html'], commodityNomenclature);
app.get(['/report', '/report.html'], report);
app.get(['/salary-statement'], salaryStatement);
app.get(['/analytics'], require('./routes/analytics'));
app.get(['/sales-report'], require('./routes/sales-report'));

app.get('/cars', require('./routes/cars/index').list);
app.get('/cars/:id', checkParams('id'), require('./routes/cars/index').view);

app.get('/customers', require('./routes/customers/index').list);

app.get('/clients', require('./routes/clients').list);
app.get('/clients/:id', checkParams('id'), require('./routes/clients').view);

app.get('/new-page-4', async (req, res, next) => {

    const drivers = await db.execQuery(`SELECT * FROM drivers`);

    res.render('new-page-4', { drivers });
})

app.get('/itineraries', require('./routes/itineraries').list);
app.get('/itineraries/:id', checkParams('id'), require('./routes/itineraries').view);

app.get('/cash-storages', require('./routes/cash-storages').list);
app.get('/cash-storages/:id', checkParams('id'), require('./routes/cash-storages').view);

app.get('/additional-services', require('./routes/additional-services').list);
app.get('/additional-services/:id', checkParams('id'), require('./routes/additional-services').view);

app.get('/apartments', require('./routes/apartments'));

app.get('/apartment-reservations', checkParams('id'), require('./routes/apartment-reservations').list);
app.get('/apartment-reservations/:id', checkParams('id'), require('./routes/apartment-reservations').view);

app.get('/new-page-:id', (req, res, next) => {
    const { id } = req.params;
    res.render('new-page-' + id);
})

app.get('/logout', (req, res, next) => {
    req.session.user = {};
    res.redirect('/pages-signin');
})

// 404 error
app.use((req, res, next) => res.render('404'));

// express error handler
app.use((error, req, res, next) => {

    if (error.status == '403') {
        return res.status(403).redirect('/pages-signin');
    } else {
        return res.render('error', { error });
    }
});

app.listen(config.web.PORT, () => {
    console.log(`Приложение запущено на порту ${config.web.PORT}`);
})

module.exports = app;