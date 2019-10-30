const db = require('../../libs/db');

const { invoicesModel, customersModel } = require('../../models');

module.exports = async (req, res, next) => {

    const incomes = await db.execQuery(`
        SELECT i.*,
            c.name as customer_name,
            cs.name as cashbox_name
        FROM incomes i
            LEFT JOIN customers c ON c.id = i.customer_id
            LEFT JOIN cash_storages cs ON cs.id = i.cash_storage_id
    `);

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations`);

    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);

    const invoices = (await invoicesModel.get({ isPaid: false }))
        .map(item => (item.code = 'pd-' + item.id, item));

    incomes.forEach(item => {
        item.base = item.base_id || item.base_other;
    });

    const groupDocuments = [
        { label: 'Аренда автомобилей', documents: carReservations, },
        { label: 'Аренда квартир', documents: apartmentReservations, },
        { label: 'Счета для оплаты', documents: invoices, },
    ];

    const customers = await customersModel.get();

    res.render(__dirname + '/incomes-list', {
        incomes,
        groupDocuments,
        cashStorages,
        customers
    });
}