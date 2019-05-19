const router = require('express').Router();

router.get('/', async (req, res, next) => {
    res.render(__dirname + '/template.hbs', {});
});

module.exports = router;