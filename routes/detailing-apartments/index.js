const express = require('express');
const router = express.Router();

const db = require('../../libs/db');

const {
    detailingApartmentsModel,
    passengersModel,
    apartmentsModel,
    managersModel,
    detailingApartmentsDetailsModel,
    apartmentsReservsModel
} = require('../../models');

router.get('/', async (req, res, next) => {
    const detailing = await detailingApartmentsModel.get();
    const apartments = await apartmentsModel.get();
    const managers = await managersModel.get();
    const passengers = await passengersModel.get();

    return res.render(__dirname + '/template.hbs', {
        detailing,
        passengers,
        managers,
        apartments
    });
})

router.get('/:id', async (req, res, next) => {

    const { id } = req.params;
    const [detailing = {}] = await detailingApartmentsModel.get({ id });

    if (!detailing.id)
        throw new Error('Страница не найдена');

    const ids = (await detailingApartmentsDetailsModel.get({ detailing_id: id })).map(item => item.reserv_id).join(',');

    const reservs = await apartmentsReservsModel.get({ ids });

    return res.render(__dirname + '/view.hbs', { det: detailing, id, reservs });
})

module.exports = router;