const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const incomes = await db.execQuery(`SELECT * FROM incomes`);

    const carReservations = await db.execQuery(`SELECT *, CONCAT('C-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('A-', id) as code FROM apartment_reservations`);

    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);

    incomes.forEach(item => {
        item.base = item.base_id || item.base_other;
    })

    const groupDocuments = [
        { label: 'Аренда автомобилей', documents: carReservations, },
        { label: 'Аренда квартир', documents: apartmentReservations, }
    ];

    res.render(__dirname + '/incomes-list', {
        incomes,
        groupDocuments,
        cashStorages
    });
}