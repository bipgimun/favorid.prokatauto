const express = require('express');
const router = express.Router();

const db = require('../../libs/db');

const { detailingApartmentsModel } = require('../../models');

router.get('/', async (req, res, next) => {
    const detailing = await detailingApartmentsModel.get();
    return res.render(__dirname + '/template.hbs', { detailing });
})

module.exports = router;