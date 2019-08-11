const db = require('../../libs/db');
const {
    costsCategories: costsCategoriesModel,
    drivers: driversModel
} = require('../../models');

module.exports = async (req, res, next) => {
    const { id } = req.params;

    const costs = await db.execQuery(`
        SELECT c.*,
            cc.title as category,
            cs.name as cashbox_name
        FROM costs c
            LEFT JOIN costs_categories cc ON cc.id = c.category_id
            JOIN cash_storages cs ON cs.id = c.cash_storage_id
        WHERE c.id = ?
    `, [id]);

    if (!costs.length) {
        throw new Error('Страница не найдена или была удалена')
    }

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations`);

    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);
    const costsCategories = await costsCategoriesModel.get();

    costs.forEach(item => {
        item.base = item.base_id || item.base_other;
    })

    let driver = {};

    if (costs[0].driver_id) {
        [driver = {}] = await driversModel.get({ id: costs[0].driver_id });
    }

    const groupDocuments = [
        { label: 'Аренда автомобилей', documents: carReservations, },
        { label: 'Аренда квартир', documents: apartmentReservations, }
    ];

    res.render(__dirname + '/costs-view', {
        costs,
        groupDocuments,
        cashStorages,
        costsCategories,
        id,
        driver
    });
}