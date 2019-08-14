const router = require('express').Router();

const db = require('../../libs/db');
const {
    customersModel,
} = require('../../models');

const moment = require('moment');

router.get('/', async (req, res, next) => {

    const suppliers = await db.execQuery(`SELECT * FROM suppliers`);

    return res.render(__dirname + '/list.hbs', { suppliers });
});

module.exports = router;