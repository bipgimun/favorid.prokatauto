const express = require('express');
const router = express.Router();

const db = require('../../libs/db');

const { detailingCarsModel } = require('../../models');

router.get('/', async (req, res, next) => {
    const detailing = await detailingCarsModel.get();
    return res.render(__dirname + '/template.hbs', { detailing });
})

module.exports = router;