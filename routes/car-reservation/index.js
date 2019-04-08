const express = require('express');
const router = express.Router();

const { checkParams } = require('../../libs/check-params');

router.get('/', require('./list'));
router.get('/archive', require('./list'));
router.get('/:id', checkParams('id'), require('./view'));

module.exports = router;