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
    leftDate: Joi.date().iso().default(null),
    rightDate: Joi.date().iso().default(null),
    driver_id: Joi.string().allow('').default(null),
    report_id: Joi.number(),
    ids: Joi.string(),
});

const saveReportSchema = Joi.object({
    period_left: Joi.date().iso().required(),
    period_right: Joi.date().iso().required(),
    driver_id: Joi.string().empty('').default(null),
    ids: Joi.string().required(),
})

router.post('/delete', async (req, res, next) => {
    const { id } = req.body;

    if (!id)
        throw new Error('Отсутствует id');

    await db.execQuery(`DELETE FROM salary_reports WHERE id = ?`, [id]);

    return res.json({ status: 'ok' });
})

router.get('/print', async (req, res, next) => {

    let safeValues = await printSchema.validate(req.query);

    if (safeValues.report_id) {
        const [report] = await db.execQuery('SELECT * FROM salary_reports WHERE id = ?', [safeValues.report_id]);

        if (!report)
            throw new Error('Отчёт не найден');

        const details = await db.execQuery(`SELECT * FROM salary_reports_details WHERE report_id = ?`, [report.id]);
        const ids = details.map(detail => detail.reserv_id).join(',');

        report.leftDate = report.period_left;
        report.rightDate = report.period_right;

        safeValues = { ...report, ids };
    }

    const { leftDate, rightDate, ids } = safeValues;

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
            result.total += +reserv.driver_salary;
            result.details.push([moment(reserv.close_at).format(format), `Заявка №${reserv.id}`, +reserv.driver_salary]);
        });

        totalSum += +result.total;

        return result;
    })

    const file = await printSalary({ period, dataArray, totalSum });

    res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
        fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
    });
});

module.exports = router;