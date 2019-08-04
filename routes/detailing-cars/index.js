const express = require('express');
const router = express.Router();

const { checkParams } = require('../../libs/check-params');

const {
    detailingCarsModel,
    passengersModel,
    drivers: driversModel,
    carsModel,
    managersModel,
    detailingCarsDetailsModel,
    carsReservsModel
} = require('../../models');

router.get('/', async (req, res, next) => {
    const detailing = await detailingCarsModel.get();
    const passengers = await passengersModel.get();
    const drivers = await driversModel.get();
    const cars = await carsModel.get();
    const managers = await managersModel.get();

    return res.render(__dirname + '/template.hbs', {
        detailing,
        passengers,
        drivers,
        managers,
        cars
    });
})

router.get('/:id', checkParams('id'), async (req, res, next) => {
    const { id } = req.params;


    const [det = {}] = await detailingCarsModel.get({ id });

    if (!det.id)
        throw new Error('Страница не найдена');

    const detailing = await detailingCarsDetailsModel.get({ detailing_id: id });

    const ids = detailing.map(item => item.reserv_id).join(',');

    const reservs = await carsReservsModel.get({ ids });

    return res.render(__dirname + '/view.hbs', { detailing, id, det, reservs });
});

module.exports = router;