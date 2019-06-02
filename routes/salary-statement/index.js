const router = require('express').Router();
const db = require('../../libs/db');

router.get('/', async (req, res, next) => {
    const employees = await db.execQuery(`SELECT * FROM employees`);
    res.render(__dirname + '/salary-statement', { employees });
})

module.exports = router;