const router = require('express').Router();

router.get('/', async (req, res, next) => {
    return res.render(__dirname + '/suppliers.hbs', {

    });
})

module.exports = router;