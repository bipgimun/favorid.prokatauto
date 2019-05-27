const express = require('express');
const router = express.Router();

const { checkParams } = require('../../libs/check-params');

const {
    detailingCarsModel,
    detailingCarsDetailsModel,
    carsReservsModel
} = require('../../models');

router.get('/', async (req, res, next) => {
    const detailing = await detailingCarsModel.get();
    return res.render(__dirname + '/template.hbs', { detailing });
})

router.get('/:id', checkParams('id'), async (req, res, next) => {
    const { id } = req.params;


    const [det = {}] = await detailingCarsModel.get({ id });
    
    if(!det.id)
        throw new Error('Страница не найдена');

    const detailing = await detailingCarsDetailsModel.get({ detailing_id: id });

    const ids = detailing.map(item => item.reserv_id).join(',');

    const reservs = await carsReservsModel.get({ ids });

    return res.render(__dirname + '/view.hbs', { detailing, id, det, reservs });
});

module.exports = router;