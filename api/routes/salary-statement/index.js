const router = require('express').Router();
const path = require('path');
const fs = require('fs');

const printSalary = require('../../../libs/salary-print');

const moment = require('moment');

const format = 'DD.MM.YYYY';
const { carsReservsModel } = require('../../../models');

const Joi = require('joi');

const printSchema = Joi.object({
    leftDate: Joi.date().iso().required(),
    rightDate: Joi.date().iso().required(),
    driver_id: Joi.string().allow('').default(null)
});

router.post('/getTable', require('./getTable'));

router.get('/print', async (req, res, next) => {

    const safeValues = await printSchema.validate(req.query);

    const { leftDate, rightDate, driver_id } = safeValues;

    if (!leftDate || !rightDate)
        throw new Error('Отсутствует период');

    const period = `${moment(leftDate).format(format)} - ${moment(rightDate).format(format)}`;

    const reservs = await carsReservsModel.get({ driver_id, closeLeft: moment(leftDate).format('YYYY-MM-DD'), closeRight: moment(rightDate).format('YYYY-MM-DD'), statuses: '2' });

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
    // console.log("TCL: dataArray", dataArray)

    const file = await printSalary({ period, dataArray, totalSum });

    res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
        fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
    });
});

module.exports = router;