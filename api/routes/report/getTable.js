const calcReport = require('../../../libs/report/calc-report');

module.exports = async (req, res, next) => {
    const { leftDate, rightDate } = req.body;
    const report = await calcReport({ leftDate, rightDate });

    res.render('partials/report-table', { layout: false, ...report }, (error, html) => {
        if (error) {
            console.error(error);
            return res.json({ status: 'bad', data: 'Что-то пошло не так. Обратитесь к администратору.' });
        }

        res.json({ status: 'ok', data: html });
    })
}