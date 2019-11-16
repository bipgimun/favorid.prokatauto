const router = require('express').Router();
const path = require('path');
const fs = require('fs');

const printSalary = require('../../../libs/salary-print');

const moment = require('moment');

const format = 'DD.MM.YYYY';
const { carsReservsModel } = require('../../../models');

const Joi = require('joi');

const db = require('../../../libs/db');

const printSchema = Joi.object({
    leftDate: Joi.date().iso().required(),
    rightDate: Joi.date().iso().required(),
    driver_id: Joi.string().allow('').default(null),
    ids: Joi.string().required(),
});

const saveReportSchema = Joi.object({
    period_left: Joi.date().iso().required(),
    period_right: Joi.date().iso().required(),
    driver_id: Joi.string().empty('').default(null),
    ids: Joi.string().required(),
})

router.post('/getTable', require('./getTable'));

router.get('/print', async (req, res, next) => {

    const safeValues = await printSchema.validate(req.query);

    const { leftDate, rightDate, driver_id, ids } = safeValues;

    const period = `${moment(leftDate).format(format)} - ${moment(rightDate).format(format)}`;

    const reservs = await carsReservsModel.get({ ids, statuses: '2' });

    const reservsMapByDriver = reservs.reduce((acc, value) => {

        acc[value.driver_name] = acc[value.driver_name] || [];
        acc[value.driver_name].push(value);

        return acc;
    }, {});

    let totalSum = 0;

    const dataArray = Object.keys(reservsMapByDriver).map(driver_name => {

        const result = {
            driver: driver_name,
            total: 0,
            details: []
        };

        const reservs = reservsMapByDriver[driver_name];

        reservs.forEach(reserv => {

            const { id, created_at, driver_salary: sum } = reserv;
            const formatedDate = moment(created_at).format('DD.MM.YYYY');

            const startTime = moment(reserv.rent_start).format('DD.MM.YYYY, HH:mm');

            result.total += +reserv.driver_salary;
            result.details.push({
                id,
                sum,
                description: `Заявка №${id}`,
                date: formatedDate,
                itinerarie_name: reserv.itinerarie_name,
                passenger_name: reserv.passenger_name,
                customer_name: reserv.customer_name,
                startTime,
                itinerarie_point_b: reserv.itinerarie_point_b
            });
        });

        totalSum += +result.total;

        return result;
    })

    const file = await printSalary({ period, dataArray, totalSum });

    res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
        fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
    });
});

router.post('/saveReport', async (req, res, next) => {

    const { ids, ...validValues } = await saveReportSchema.validate(req.body);

    const reservs = await carsReservsModel.get({ ids });
    const sum = reservs.map(reserv => +reserv.driver_salary)
        .reduce((acc, value) => (acc + value), 0);

    validValues.manager_id = req.session.user.employee_id;

    const id = await db.insertQuery(`INSERT INTO salary_reports SET ?`, [{ ...validValues, sum }]);

    const [report = {}] = await db.execQuery(`
        SELECT sr.*,
            d.name as driver_name
        FROM salary_reports sr
            LEFT JOIN drivers d ON d.id = sr.driver_id
        WHERE sr.id = ?`, [id]
    );

    for (const reserv_id of ids.split(',')) {
        await db.insertQuery(`INSERT INTO salary_reports_details SET ?`, { report_id: id, reserv_id });
    }

    report.created_at = moment(report.created_at).format(format);
    report.driver_name = report.driver_name ? report.driver_name : 'По всем водителям';

    res.json({ status: 'ok', body: report });
})

module.exports = router;