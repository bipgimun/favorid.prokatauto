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
            cs.name as cashbox_name,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name,
            s.name as supplier_name,
            cust.name as customer_name
        FROM costs c
            LEFT JOIN costs_categories cc ON cc.id = c.category_id
            LEFT JOIN cash_storages cs ON cs.id = c.cash_storage_id
            LEFT JOIN employees e ON e.id = c.manager_id
            LEFT JOIN suppliers s ON s.id = c.supplier_id
            LEFT JOIN customers cust ON cust.id = c.customer_id
        WHERE c.id = ?
    `, [id]);

    if (!costs.length) {
        throw new Error('Страница не найдена или была удалена')
    }

    const [cost] = costs;

    const details = await db.execQuery(`SELECT * FROM costs_details WHERE cost_id = ?`, [cost.id]);

    const grouppedDetails = details.reduce((acc, item) => {
        acc[item.target_type] = acc[item.target_type] || [];
        acc[item.target_type].push(item);
        return acc;
    }, {});

    for (const key of Object.keys(grouppedDetails)) {
        const detail = grouppedDetails[key];

        for (const item of detail) {

            const { target_id } = item;

            if (item.target_type == 'auto') {
                const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [target_id]);
                item.name = `${car.name} ${car.model} - ${car.number}`;
            } else if (item.target_type == 'apartments') {
                const [apartment] = await db.execQuery(`SELECT * FROM apartments WHERE id = ?`, [target_id]);
                item.name = apartment.address;
            } else if (item.target_type == 'drivers') {
                const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [target_id]);
                item.name = driver.name;
            } else if (item.target_type == 'contracts') {
                const [contract] = await db.execQuery(`SELECT * FROM muz_contracts WHERE id = ?`, [target_id]);
                item.name = 'MUZ-' + contract.id;
            } else if(item.target_type === 'carsReserv') {
                const [carReserv] = await db.execQuery('SELECT * FROM cars_reservations WHERE id = ?', [target_id]);
                
                if(!carReserv) 
                    continue;

                item.name = 'CRR-' + carReserv.id;
            } else if(item.target_type === 'zalog') {
                const [carReserv] = await db.execQuery('SELECT * FROM cars_reservations WHERE id = ?', [target_id]);
                
                if(!carReserv) 
                    continue;

                item.name = 'CRR-' + carReserv.id;
            }
        }
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

    const cars = await db.execQuery(`SELECT * FROM cars`);
    const apartments = await db.execQuery(`SELECT * FROM apartments`);
    const drivers = await db.execQuery(`SELECT * FROM drivers ORDER BY name ASC`);
    const contracts = await db.execQuery(`SELECT * FROM muz_contracts`);
    const carsReservs = await db.execQuery('SELECT * FROM cars_reservations');

    res.render(__dirname + '/costs-view', {
        costs,
        groupDocuments,
        cashStorages,
        carsReservs,
        cars,
        apartments,
        drivers,
        contracts,
        costsCategories,
        grouppedDetails,
        id,
        driver
    });
}