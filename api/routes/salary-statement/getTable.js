const calcSalary = require('../../../libs/salaryStatement/calcByEmployee');

module.exports = async (req, res, next) => {
    const { leftDate, rightDate, driver_id } = req.body;

    const { details, total } = await calcSalary({ leftDate, rightDate, driver_id });

    res.render('partials/salary-table.hbs', { layout: false, details, total }, (error, html) => {
        if (error) return res.json({ status: 'bad', body: error.message });

        res.json({ status: 'ok', body: html });
    });
}