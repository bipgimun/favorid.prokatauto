const express = require('express');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const router = express.Router();

const getCarDetailing = require('../../../libs/car-detailing');

const { carsReservsModel, customersModel } = require('../../../models');

router.get('/downloadDetail', async (req, res, next) => {

    const { fromPeriod, endPeriod, customer_id, ids } = req.query;

    const period = moment(fromPeriod).format('DD.MM.YYYY') + ' - ' + moment(endPeriod).format('DD.MM.YYYY');

    const reservs = (await carsReservsModel.get({ ids }))
        .map(item => {
            return [
                moment(item.rent_start).format('DD.MM.YYYY'),
                moment(item.rent_start).format('HH:mm'),
                item.itinerarie_name || '',
                item.passenger_name,
                item.comment || '',
                item.sum,
            ];
        })
    const [customer = {}] = await customersModel.get({ id: customer_id });

    try {
        const file = await getCarDetailing({ period, customer, dataArray: reservs });

        res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
            fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
        });

    } catch (error) {
        throw new Error(error);
    }
});

module.exports = router;