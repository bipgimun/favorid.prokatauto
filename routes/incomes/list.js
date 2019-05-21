const db = require('../../libs/db');

const { invoicesModel } = require('../../models');

module.exports = async (req, res, next) => {

    const incomes = await db.execQuery(`SELECT * FROM incomes`);

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

    res.render(__dirname + '/incomes-list', {
        incomes,
        groupDocuments,
        cashStorages
    });
}