const moment = require('moment');

const router = require('express').Router();
const wbSheet = require('../../../libs/waybill-sheet-print');

const db = require('../../../libs/db');

router.get('/print', async (req, res, next) => {
    const { timeMin, timeMax, driverId } = req.query;

    if(!timeMin) {
        throw new Error('Не выбрано минимальное значение даты');
    }
    
    if(!timeMax) {
        throw new Error('Не выбрано максимальное значение даты');
    }

    const dates = getDateArray(new Date(timeMin), new Date(timeMax))
        .map(date => moment(date).format('DD.MM.YYYY'));

    const drivers = (await db.execQuery(`SELECT * FROM drivers WHERE id > 0 ${driverId ? ` AND id = ${driverId} ORDER BY name ASC` : ''}`));

    const shifts = await db.execQuery(`SELECT * FROM shifts2contracts WHERE date_start BETWEEN '${moment(timeMin).format('YYYY-MM-DD')}' AND '${moment(timeMax).format('YYYY-MM-DD')}'`);

    const d = {};

    for (const shift of shifts) {
        const shiftWaybills = await db.execQuery(`SELECT * FROM drivers2shifts WHERE shift_id = ${shift.id}`);
        const tFormatted = moment(shift.date_start).format('DD.MM.YYYY');
        if(!d[tFormatted]) {
            d[tFormatted] = {};
        }

        for (const waybill of shiftWaybills) {
            
            const driverName = drivers.find(driver => driver.id == waybill.driver_id).name;

            if (!d[tFormatted][driverName]) {
                d[tFormatted][driverName] = [];
            }

            d[tFormatted][driverName].push(waybill.id);
        }
    }

    const filename = await wbSheet({ dates, drivers: drivers.map(driver => driver.name), dataMap: d });

    res.download(filename);
});

var getDateArray = function (start, end) {
    var arr = new Array();
    var dt = new Date(start);
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
}

module.exports = router;