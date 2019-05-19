const router = require('express').Router();

const fs = require('fs');
const path = require('path');
const moment = require('moment');

const {
    customersModel,
    apartmentsReservsModel,
    detailingApartmentsModel,
    detailingApartmentsDetailsModel
} = require('../../../models');

const getApartmentDetailing = require('../../../libs/apartment-detailing');

router.post('/save', async (req, res, next) => {
    const { reservsIds, customer, period_from, period_end } = req.body;

    if (!reservsIds)
        throw new Error('Отсутствуют заявки');

    const reservs = await apartmentsReservsModel.get({ ids: reservsIds });
    const sum = reservs
        .map(item => item.sum)
        .reduce((acc, sum) => +acc + +sum, 0);

    const id = await detailingApartmentsModel.add({ customer_id: customer, period_from, period_end, sum });


    await Promise.all(
        reservs.map(item => detailingApartmentsDetailsModel.add({ reserv_id: item.id, detailing_id: id }))
    );

    const [body = {}] = await detailingApartmentsModel.get({ id });

    body.created_at = moment(body.created_at).format('DD.MM.YYYY');

    return res.json({ status: 'ok', body });
});

router.get('/downloadDetail', async (req, res, next) => {
    const { fromPeriod, endPeriod, customer_id, ids } = req.query;

    const period = moment(fromPeriod).format('DD.MM.YYYY') + ' - ' + moment(endPeriod).format('DD.MM.YYYY');

    const reservs = (await apartmentsReservsModel.get({ ids }))
        .map(item => {
            return [
                moment(item.entry).format('DD.MM.YYYY'),
                moment(item.departure).format('DD.MM.YYYY'),
                item.address || '',
                item.client_name,
                item.number_of_days || 0,
                item.sum,
            ];
        })
    const [customer = {}] = await customersModel.get({ id: customer_id });

    try {
        const file = await getApartmentDetailing({ period, customer, dataArray: reservs });

        res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
            fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
        });

    } catch (error) {
        throw new Error(error);
    }
})


module.exports = router;