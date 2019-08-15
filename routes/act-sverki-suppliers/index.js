const router = require('express').Router();

const db = require('../../libs/db');
const {
    customersModel,
} = require('../../models');

const moment = require('moment');

router.get('/', async (req, res, next) => {

    const suppliers = await db.execQuery(`SELECT * FROM suppliers`);
    const documents = await db.execQuery(`
        SELECT d.*,
            s.name as supplier_name
        FROM act_sverki_suppliers_documents d
            LEFT JOIN suppliers s ON s.id = d.supplier_id
    `);

    return res.render(__dirname + '/list.hbs', { suppliers, documents });
});


router.get('/:id', async (req, res, next) => {

    const { id } = req.params;

    if (!id || !Number(id)) {
        throw new Error('Неверный id');
    }

    const [document] = await db.execQuery(`
        SELECT asd.*,
            s.name as supplier_name,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM act_sverki_suppliers_documents asd
            LEFT JOIN suppliers s ON asd.supplier_id = s.id
            LEFT JOIN employees e ON e.id = asd.manager_id
        WHERE asd.id = ?
    `, [id]);

    const details = await db.execQuery(`
        SELECT * 
        FROM act_sverki_suppliers_documents_details 
        WHERE document_id = ?`, [document.id]
    );

    const money = details.filter(item => item.gone);
    const positions = details.filter(item => item.income);

    const moneySum = money.reduce((acc, item) => +acc + +item.gone, 0);
    const positionsSum = positions.reduce((acc, item) => +acc + +item.income, 0);

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