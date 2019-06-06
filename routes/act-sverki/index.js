const router = require('express').Router();

const db = require('../../libs/db');
const { customersModel } = require('../../models');

router.get('/', async (req, res, next) => {

    const documents = await db.execQuery(`
        SELECT asd.*,
            c.name as cutomer_name
        FROM act_sverki_documents asd
            LEFT JOIN customers c ON asd.customer_id = c.id
    `);

    const customers = await customersModel.get();

    return res.render(__dirname + '/list.hbs', { documents, customers });
})

module.exports = router;