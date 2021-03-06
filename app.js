const cookieSession = require('cookie-session');
const hbs = require('express-handlebars');
const express = require('express');

const config = require('./config');

const app = express();
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
            return !!condition ? valueTrue : valueFalse;
        },
        compare(condition1, condition2, valueTrue, valueFalse) {
            return condition1 == condition2 ? valueTrue : valueFalse;
        },
        concat(...values) {
            const strings = values.slice(0, -1);
            return ''.concat(...strings);
        },
        toIsoString(date, format = moment.HTML5_FMT.DATETIME_LOCAL) {
            if (!date)
                return '';

            return moment(date).format(format);
        },
        stringify(data) {
            return JSON.stringify(data);
        },
        multiplication(v1, v2) {
            return v1 * v2;
        },

        minus(v1, v2) {
            return v1 - v2;
        },

        getDefaultNowValue() {
            return moment().format('YYYY-MM-DD');
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

// ?????????????????????? api
app.use('/api', require('./api'));

// ???????????????? ??????????????????????
app.use(require('./libs/middlewares/check-auth'));

const index = require('./routes/home');
const sales = require('./routes/sales');
const commodityNomenclature = require('./routes/commodity-nomenclature');
const incomingGoods = require('./routes/incoming-goods');
const remnantsOfGoods = require('./routes/remnants-of-goods');
const cashBox = require('./routes/cashbox');
const report = require('./routes/report');
const salaryStatement = require('./routes/salary-statement');

app.use((req, res, next) => {
    res.locals.reqUrl = req.url;
    next();
});

// ???????????????????? ?????????????????? ????????????????????
app.get(['/', '/index.html'], index);
app.get(['/sales', '/sales.html'], sales);
app.get(['/cashbox', '/cashbox.html'], cashBox);
// app.get(['/costs-income', '/costs-income.html'], costsIncome);
app.get(['/incoming-goods', '/incoming-goods.html'], incomingGoods);
app.get(['/remnants-of-goods', '/remnants-of-goods.html'], remnantsOfGoods);
app.get(['/commodity-nomenclature', '/commodity-nomenclature.html'], commodityNomenclature);
app.get(['/report', '/report.html'], report);
app.get(['/analytics'], require('./routes/analytics'));
app.get(['/sales-report'], require('./routes/sales-report'));
// -------------------------------

app.use(require('./routes'));

app.get('/new-page-:id', (req, res, next) => {
    const { id } = req.params;
    res.render('new-page-' + id);
})

app.get('/logout', (req, res, next) => {
    req.session.user = {};
    res.redirect('/pages-signin');
})

// 404 error
app.use((req, res, next) => res.status(404).render('404'));

// express error handler
app.use((error, req, res, next) => {

    if (error.status == '403') {
        return res.status(403).redirect('/pages-signin');
    } else {
        return res.render('error', { error });
    }
});

app.listen(config.web.PORT, () => {
    console.log(`[${new Date().toLocaleString()}]: ???????????????????? ???????????????? ???? ?????????? ${config.web.PORT}`);
})

module.exports = app;