const db = require('../../libs/db');

const { invoicesModel, customersModel } = require('../../models');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    const incomes = await db.execQuery(`
        SELECT i.*,
            cs.name as cashbox_name,
            cust.name as customer_name
        FROM incomes i
            LEFT JOIN cash_storages cs ON cs.id = i.cash_storage_id
            LEFT JOIN customers cust ON cust.id = i.customer_id
        WHERE i.id = ?
    `, [id]);

    if (!incomes.length) {
        throw new Error('Страница не найдена или была удалена')
    }

    const [income] = incomes;

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations WHERE customer_id = ?`, [income.customer_id || null]);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations WHERE customer_id = ?`, [income.customer_id || null]);

    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);

    incomes.forEach(item => {
        item.base = item.base_id || item.base_other;
        item.link = item.code === 'CRR'
            ? '/car-reservation' : (item.code === 'APR'
                ? '/apartment-reservations' : (item.code === 'pd'
                    ? '/invoices'
                    : ''));
    })

    const invoices = (await invoicesModel.get({ isPaid: false }))
        .map(item => (item.code = 'pd-' + item.id, item));

    const groupDocuments = [
        { label: 'Аренда автомобилей', documents: carReservations, },
        { label: 'Аренда квартир', documents: apartmentReservations, },
        { label: 'Счета для оплаты', documents: invoices, }
    ];

    const customers = await customersModel.get();
    
    res.render(__dirname + '/incomes-view', {
        incomes,
        groupDocuments,
        cashStorages,
        customers,
        id
    });
}