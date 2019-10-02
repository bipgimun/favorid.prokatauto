const router = require('express').Router();

router.get('/', async (req, res, next) => {
    res.render(__dirname + '/waybill-sheets.hbs');
})

module.exports = router;