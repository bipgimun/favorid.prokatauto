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

    const id = await detailingApartmentsModel.add({
        customer_id: customer || null,
        period_from,
        period_end,
        sum,
        manager_id: req.session.user.employee_id
    });

    await Promise.all(
        reservs.map(item => detailingApartmentsDetailsModel.add({ reserv_id: item.id, detailing_id: id }))
    );

    const [body = {}] = await detailingApartmentsModel.get({ id });

    body.created_at = moment(body.created_at).format('DD.MM.YYYY');

    return res.json({ status: 'ok', body });
});

router.get('/downloadDetail', async (req, res, next) => {
    const { fromPeriod, endPeriod, customer_id, ids, id } = req.query;

    const [detInfo = {}] = id
        ? (await detailingApartmentsModel.get({ id: id }))
        : [];

    const period = detInfo.id
        ? moment(detInfo.period_from).format('DD.MM.YYYY') + ' - ' + moment(detInfo.period_end).format('DD.MM.YYYY')
        : moment(fromPeriod).format('DD.MM.YYYY') + ' - ' + moment(endPeriod).format('DD.MM.YYYY');

    const savedIds = (await detailingApartmentsDetailsModel.get({ detailing_id: id }))
        .map(item => item.reserv_id)
        .join(',');

    const reservs = (await apartmentsReservsModel.get({ ids: savedIds || ids }))
        .map(item => {
            return [
                moment(item.entry).format('DD.MM.YYYY'),
                moment(item.departure).format('DD.MM.YYYY'),
                item.address || '',
                item.client_name,
                item.number_days || 0,
                item.sum,
            ];
        })
    const [customer = {}] = detInfo.customer_id || customer_id
        ? (await customersModel.get({ id: detInfo.customer_id || customer_id }))
        : [];

    try {
        const file = await getApartmentDetailing({ period, customer, dataArray: reservs, number: id });

        res.download(path.join(process.cwd(), 'uploads', file), file, (error) => {
            fs.unlinkSync(path.join(process.cwd(), 'uploads', file));
        });

    } catch (error) {
        throw new Error(error);
    }
})

router.post('/delete', async function (req, res, next) {

    const { id } = req.body;

    if (!id)
        throw new Error('Отсутствует id');

    await detailingApartmentsModel.delete({ id });

    return res.json({ status: 'ok' });
})


module.exports = router;