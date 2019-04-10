const express = require('express');
const router = express.Router();

router.get('/', require('./list'));
router.get('/:id', require('./view'));

module.exports = router;