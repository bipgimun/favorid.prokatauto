const moment = require('moment');
const calcReport = require('../report/calc-report');

const DATE_FORMAT = 'YYYY-MM-DD';

module.exports = async ({ leftDate = new Date(), rightDate = new Date() }) => {

    const resultGroup = {};
    const sideLeft = moment(leftDate);
    const sideRight = moment(rightDate);

    const diffDays = sideRight.diff(sideLeft, 'days');
    let interval;

    if (diffDays >= 120) {
        interval = { amount: 30 }
    } else if (diffDays >= 62) {
        interval = { amount: 6 }
    } else {
        interval = { amount: 1 }
    }

    const datesArray = getDatesArray(sideLeft, sideRight, interval);

    for (const { leftDate, rightDate } of datesArray) {

        const result = await calcReport({ leftDate, rightDate });

        const key = interval.amount > 1
            ? new Date(leftDate).toLocaleDateString() + ' - ' + new Date(rightDate).toLocaleDateString()
            : new Date(leftDate).toLocaleDateString();

        resultGroup[key] = result;
    }

    return resultGroup;
}

const getDatesArray = function (start = moment(), end = moment(), { amount = 1, unit = 'days' }) {

    const result = [];
    const currentDate = moment(start);

    while (currentDate <= end) {

        const addAmount = amount > 1
            ? amount + 1
            : amount;

        const leftDate = moment(currentDate);
        const rightDate = moment(currentDate);

        if (amount > 1) {
            if (moment(rightDate).add(amount, 'days') <= end) {
                rightDate.add(amount, 'days');
            } else {
                const diff = end.diff(rightDate, 'days');

                rightDate.add(diff, 'days');
            }
        }

        result.push({
            leftDate: new Date(leftDate.format(DATE_FORMAT)),
            rightDate: new Date(rightDate.format(DATE_FORMAT))
        });

        currentDate.add(addAmount, 'days');
    }

    return result;
}


    // if (sideRight.diff(sideLeft, 'months') >= 4) {
    //     // по месяцам
    // } else if (sideRight.diff(sideLeft, 'days') >= 62) {
    //     // по неделям
    // } else {
    //     // по дням GROUP BY 
    // }