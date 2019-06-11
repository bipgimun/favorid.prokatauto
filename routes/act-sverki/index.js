const router = require('express').Router();

const db = require('../../libs/db');
const { customersModel } = require('../../models');

const moment = require('moment');

router.get('/', async (req, res, next) => {

    const documents = await db.execQuery(`
        SELECT asd.*,
            c.name as customer_name
        FROM act_sverki_documents asd
            LEFT JOIN customers c ON asd.customer_id = c.id
    `);

    const customers = await customersModel.get();

    return res.render(__dirname + '/list.hbs', { documents, customers });
})

router.get('/:id', async (req, res, next) => {

    const { id } = req.params;

    if (!id || !Number(id)) {
        throw new Error('Неверный id');
    }

    const [document] = await db.execQuery(`
        SELECT asd.*,
            c.name as customer_name
        FROM act_sverki_documents asd
            LEFT JOIN customers c ON asd.customer_id = c.id\
        WHERE asd.id = ?
    `, [id]);

    const details = await db.execQuery(`
        SELECT * 
        FROM act_sverki_documents_details 
        WHERE document_id = ?`, [document.id]
    );

    const money = details.filter(item => item.income);
    const positions = details.filter(item => item.gone);

    const moneySum = money.reduce((acc, item) => +acc + +item.income, 0);
    const positionsSum = positions.reduce((acc, item) => +acc + +item.gone, 0);

    const { saldo, period_left, sum } = document;

    const saldoDate = moment(period_left).subtract(1, 'day').format('DD.MM.YYYY');

    return res.render(__dirname + '/view.hbs', {
        document,
        id,
        money,
        positions,
        moneySum,
        positionsSum,
        saldoDate,
        saldoSum: saldo,
        total: sum,
    });
})

module.exports = router;