const express = require('express');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const router = express.Router();

const getCarDetailing = require('../../../libs/car-detailing');

const {
    carsReservsModel,
    customersModel,
    detailingCarsModel,
    detailingCarsDetailsModel,
} = require('../../../models');

router.post('/save', async (req, res, next) => {
    const { reservsIds, customer, period_from, period_end } = req.body;

    if (!reservsIds)
        throw new Error('Отсутствуют заявки');

    const reservs = await carsReservsModel.get({ ids: reservsIds });
    const sum = reservs
        .map(item => item.sum)
        .reduce((acc, sum) => +acc + +sum, 0);

    const id = await detailingCarsModel.add({ customer_id: customer, period_from, period_end, sum });


    await Promise.all(
        reservs.map(item => detailingCarsDetailsModel.add({ reserv_id: item.id, detailing_id: id }))
    );

    const [body = {}] = await detailingCarsModel.get({ id });

    body.created = moment(body.created).format('DD.MM.YYYY');

    return res.json({ status: 'ok', body });
});

router.get('/downloadDetail', async (req, res, next) => {

    const { fromPeriod, endPeriod, customer_id, ids, id } = req.query;

    const [detInfo = {}] = id
        ? []
        : (await detailingCarsModel.get({ id: id }));

    const period = detInfo.id
        ? moment(detInfo.period_from).format('DD.MM.YYYY') + ' - ' + moment(detInfo.period_end).format('DD.MM.YYYY')
        : moment(fromPeriod).format('DD.MM.YYYY') + ' - ' + moment(endPeriod).format('DD.MM.YYYY');

    const savedIds = (await detailingCarsDetailsModel.get({ detailing_id: id }))
        .map(item => item.reserv_id)
        .join(',');

    const reservs = (await carsReservsModel.get({ ids: savedIds || ids }))
        .map(item => {
            
            let adress = ''; 

            if(item.itinerarie_point_a && item.itinerarie_point_b) {
                adress = `${item.itinerarie_point_a} - ${item.itinerarie_point_b}`;
            } else if(item.itinerarie_name) {
                adress = item.itinerarie_name;
            }
            
            return [
                moment(item.rent_start).format('DD.MM.YYYY'),
                moment(item.rent_start).format('HH:mm'),
                adress,
                item.passenger_name,
                item.comment || '',
                item.sum,
            ];
        })

    const [customer = {}] = await customersModel.get({ id: detInfo.customer_id || customer_id });

    try {
        const file = await getCarDetailing({ period, customer, dataArray: reservs, number: id });

        res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
            fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
        });

    } catch (error) {
        throw new Error(error);
    }
});

router.post('/delete', async function (req, res, next) {

    const { id } = req.body;

    if (!id)
        throw new Error('Отсутствует id');

    await detailingCarsModel.delete({ id });

    return res.json({ status: 'ok' });
})

module.exports = router;