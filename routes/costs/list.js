const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const costs = await db.execQuery(`
        SELECT c.*,
            cc.title as category
        FROM costs c
            LEFT JOIN costs_categories cc ON cc.id = c.category_id
    `);

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations`);

    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);
    const costsCategories = await db.execQuery(`SELECT * FROM costs_categories`);

    costs.forEach(item => {
        item.base = item.base_id || item.base_other;
    })

    const groupDocuments = [
        { label: 'Аренда автомобилей', documents: carReservations, },
        { label: 'Аренда квартир', documents: apartmentReservations, }
    ];

    res.render(__dirname + '/costs-list', {
        costs,
        groupDocuments,
        cashStorages,
        costsCategories
    });
}