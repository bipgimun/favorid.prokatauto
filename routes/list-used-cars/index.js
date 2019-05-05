const express = require('express');
const router = express.Router();

const db = require('../../libs/db');
const moment = require('moment');

router.get('/', async (req, res, next) => {

    const cars = await db.execQuery(`SELECT * FROM cars WHERE company_property = 1`);
    const carsIds = cars.map(car => car.id).join(',');

    const minRentStart = (await db.execQuery(`SELECT MIN(rent_start) as date FROM cars_reservations LIMIT 1`))
        .map(item => item.date).join(',');

    const maxRentFinished = (await db.execQuery(`SELECT MAX(rent_finished) as date FROM cars_reservations LIMIT 1`))
        .map(item => item.date).join(',');

    const reservs = await db.execQuery(`
        SELECT * 
        FROM cars_reservations 
        WHERE 
            car_id IN (${carsIds})
            AND rent_start >= '${moment(new Date(minRentStart)).format('YYYY-MM-DDTHH:mm')}'
            AND rent_finished <= '${moment(new Date(maxRentFinished)).format('YYYY-MM-DDTHH:mm')}'
    `);

    const usedCarsGroup = reservs.reduce((acc, item) => {
        const { car_id, rent_start, rent_finished } = item;

        acc[car_id] = acc[car_id] || [];

        acc[car_id].push([moment(rent_start).toISOString(), moment(rent_finished).toISOString()]);

        return acc;
    }, {});


    const datesArray = enumerateDaysBetweenDates(
        moment(new Date(minRentStart)), moment(new Date(maxRentFinished))
    );

    const resArray = [];

    datesArray.forEach(date => {

        const lCars = [];
        const formatedDate = moment(date).format('DD.MM.YYYY');

        cars.forEach(car => {
            const carReservs = usedCarsGroup[car.id] || [];

            const c = {
                id: car.id,
                isReserved: false,
                message: '',
            }

            carReservs.some(([rent_start, rent_finished]) => {

                const startTime = moment(rent_start).format('HH:mm');
                const finishTime = moment(rent_finished).format('HH:mm');

                c.isReserved = moment(date).isBetween(rent_start, rent_finished, 'days', '[]');

                if (moment(date).isSame(rent_start, 'days')) {
                    c.message = `С ${startTime}`;
                }

                if (moment(date).isSame(rent_finished, 'days')) {
                    c.message = `До ${finishTime}`;
                }

                if (moment(date).isSame(rent_start, 'days') && moment(date).isSame(rent_finished, 'days')) {
                    c.message = `С ${startTime} до ${finishTime}`;
                }


                return c.isReserved;
            })

            lCars.push(c);
        })

        resArray.push({ date: formatedDate, cars: lCars });
    })

    return res.render(__dirname + '/template', { cars, resArray });
})

var enumerateDaysBetweenDates = function (startDate, endDate) {
    var now = startDate.clone(), dates = [];

    while (now.isSameOrBefore(endDate)) {
        dates.push(now.format('YYYY-MM-DD'));
        now.add(1, 'days');
    }
    return dates;
};

module.exports = router;