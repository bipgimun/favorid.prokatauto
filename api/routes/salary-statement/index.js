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
    // ids: Joi.string(),
    reservsIds: Joi.string().empty(''),
    shiftsIds: Joi.string().empty('')
});

const saveReportSchema = Joi.object({
    period_left: Joi.date().iso().required(),
    period_right: Joi.date().iso().required(),
    driver_id: Joi.string().empty('').default(null),
    // ids: Joi.string(),
    reservsIds: Joi.string().empty(''),
    shiftsIds: Joi.string().empty('')
});

const getShifts = async (ids = '') => {

    if (!ids) {
        return [];
    }

    return db.execQuery(`
        SELECT d2s.*,
            s2c.contract_id,
            s2c.date_start as shift_start,
            d.name as driver_name
        FROM drivers2shifts d2s
            LEFT JOIN shifts2contracts s2c ON d2s.shift_id = s2c.id
            LEFT JOIN drivers d ON d.id = d2s.driver_id
        WHERE 
            d2s.id IN (${ids})
    `);
};

router.post('/getTable', require('./getTable'));

router.get('/print', async (req, res, next) => {

    const safeValues = await printSchema.validate(req.query);

    const { leftDate, rightDate, driver_id, ids, reservsIds = '', shiftsIds = '' } = safeValues;

    const period = `${moment(leftDate).format(format)} - ${moment(rightDate).format(format)}`;

    const reservs = reservsIds ? await carsReservsModel.get({ ids: reservsIds, statuses: '2' }) : [];
    const shifts = shiftsIds ? await getShifts(shiftsIds) : [];



    const reservsMapByDriver = [...reservs, ...shifts].reduce((acc, value) => {

        acc[value.driver_name] = acc[value.driver_name] || { reservs: [], shifts: [] };

        if (value.type && value.shift_id) {
            acc[value.driver_name].shifts.push(value);
        } else {
            acc[value.driver_name].reservs.push(value);
        }

        return acc;
    }, {});

    let totalSum = 0;

    const dataArray = Object.keys(reservsMapByDriver).map(driver_name => {

        const result = {
            driver: driver_name,
            total: 0,
            details: []
        };

        const {reservs, shifts} = reservsMapByDriver[driver_name];

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

        for (const shift of shifts) {
            const { id, create_at, value: salaryRate, hours, shift_start } = shift;
            const formatedDate = moment(create_at).format('DD.MM.YYYY');
    
            const startTime = moment(shift_start).format('DD.MM.YYYY, HH:mm');
    
            const sum = salaryRate * hours;

            result.total += +sum;
    
            result.details.push({
                id,
                shiftId: id,
                sum: String(sum),
                description: `Смена №${shift.shift_id} по контракту №${shift.contract_id}`,
                date: formatedDate,
                itinerarie_name: '',
                passenger_name: '',
                customer_name: '',
                code: 'muz',
                startTime,
                itinerarie_point_b: ''
            });
        }

        totalSum += +result.total;

        return result;
    })

    const file = await printSalary({ period, dataArray, totalSum });

    res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
        fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
    });
});

router.post('/saveReport', async (req, res, next) => {

    const { ids, reservsIds = '', shiftsIds = '', ...validValues } = await saveReportSchema.validate(req.body);

    const reservs = reservsIds ? await carsReservsModel.get({ ids: reservsIds }) : [];
    const shifts = shiftsIds ? await getShifts(shiftsIds) : [];

    const sumReservs = reservs.map(reserv => +reserv.driver_salary)
        .reduce((acc, value) => (acc + value), 0);

    const sum = shifts.map(item => (+item.value * +item.hours))
        .reduce((acc, value) => (+acc + +value), sumReservs);

    validValues.manager_id = req.session.user.employee_id;

    const id = await db.insertQuery(`INSERT INTO salary_reports SET ?`, [{ ...validValues, sum }]);

    const [report = {}] = await db.execQuery(`
        SELECT sr.*,
            d.name as driver_name
        FROM salary_reports sr
            LEFT JOIN drivers d ON d.id = sr.driver_id
        WHERE sr.id = ?`, [id]
    );

    if (reservsIds) {
        for (const reserv_id of reservsIds.split(',')) {
            await db.insertQuery(`INSERT INTO salary_reports_details SET ?`, { report_id: id, reserv_id });
        }
    }

    if (shiftsIds) {
        for (const shiftId of shiftsIds.split(',')) {
            await db.insertQuery(`INSERT INTO salary_reports_details SET ?`, { report_id: id, shift_id: shiftId });
        }
    }

    report.created_at = moment(report.created_at).format(format);
    report.driver_name = report.driver_name ? report.driver_name : 'По всем водителям';

    res.json({ status: 'ok', body: report });
})

module.exports = router;