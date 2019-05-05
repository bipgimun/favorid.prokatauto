const db = require('../../libs/db');
const { costsCategories: costsCategoriesModel } = require('../../models');

module.exports = async (req, res, next) => {

    const costs = await db.execQuery(`
        SELECT c.*,
            cc.title as category
        FROM costs c
            LEFT JOIN costs_categories cc ON cc.id = c.category_id
    `);

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations`);
    const cars = await db.execQuery(`SELECT *, CONCAT('CAR-', id) as code FROM cars WHERE company_property = 1`);

    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);
    const costsCategories = await costsCategoriesModel.get();

    costs.forEach(item => {
        item.base = item.base_id || item.base_other;
    })

    cars.forEach(car => {
        car.subcode = `(${car.name} ${car.model} ${car.number})`;
    })

    const groupDocuments = [
        { label: 'Аренда автомобилей', documents: carReservations, },
        { label: 'Аренда квартир', documents: apartmentReservations, },
        { label: 'Автомобили', documents: cars, },
    ];

    res.render(__dirname + '/costs-list', {
        costs,
        groupDocuments,
        cashStorages,
        costsCategories
    });
}