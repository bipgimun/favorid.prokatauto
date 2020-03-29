const router = require('express').Router();
const db = require('../../libs/db');

const { drivers: driversModel } = require('../../models/')

const calcSalary = require('../../libs/salaryStatement/calcByEmployee')

router.get('/', async (req, res, next) => {
    const drivers = await driversModel.get();
    const reports = await db.execQuery(`SELECT sr.*,
            d.name as driver_name
        FROM salary_reports sr
            LEFT JOIN drivers d ON d.id = sr.driver_id`);

    res.render(__dirname + '/salary-statement', { drivers, reports });
})

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    const [report] = await db.execQuery(`
        SELECT sr.*,
            d.name as driver_name,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM salary_reports sr
            LEFT JOIN drivers d ON d.id = sr.driver_id
            LEFT JOIN employees e ON e.id = sr.manager_id
        WHERE sr.id = ?`, [id]);

    if (!report)
        throw new Error('Отчёт не найден');

    const { details, total } = await calcSalary({ 
        leftDate: report.period_left, 
        rightDate: report.period_right, 
        driver_id: report.driver_id
    });

    res.render(__dirname + '/view.hbs', { det: report, details, id });
})

module.exports = router;