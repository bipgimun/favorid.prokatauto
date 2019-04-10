const { checkParams } = require('../../libs/check-params');

const express = require('express');
const router = express.Router();

router.get('/', require('./list'));
router.get('/:id', checkParams('id'), require('./view'));

module.exports = router;