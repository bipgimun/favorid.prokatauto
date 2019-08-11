const router = require('express').Router();
const db = require('../../libs/db');

router.get('/', async (req, res, next) => {

    const suppliers = await db.execQuery(`SELECT * FROM suppliers`);

    return res.render(__dirname + '/suppliers.hbs', {
        suppliers
    });
})

router.get('/:id', async (req, res, next) => {

    const [suppliers = {}] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [req.params.id]);

    if (!suppliers.id) {
        throw new Error('Поставщик не найден');
    }

    return res.render(__dirname + '/suppliers-view.hbs', {
        suppliers: [suppliers]
    });
})

module.exports = router;