const calcSalary = require('../../../libs/salaryStatement/calcByEmployee');

module.exports = async (req, res, next) => {
    const { id, leftDate, rightDate } = req.body;
    const { details, total } = await calcSalary({ id, leftDate, rightDate });

    res.render('partials/salary-table.hbs', { layout: false, details, total }, (error, html) => {
        if (error) return res.json({ status: 'bad', body: error.message });

        res.json({ status: 'ok', body: html });
    });
}