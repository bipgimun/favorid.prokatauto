const calcCashbox = require('../../../libs/cashbox/calc');

module.exports = async (req, res, next) => {

    const { period, leftDate, rightDate } = req.body;

    const result = await calcCashbox({ period, leftDate, rightDate });

    res.render('partials/cashbox-table', { layout: false, ...result }, (error, html) => {
        if (error) {
            console.error(error);
            return res.json({ status: 'bad', data: 'Что-то пошло не так. Обратитесь к администратору.' });
        }

        res.json({ status: 'ok', data: html });
    });
}