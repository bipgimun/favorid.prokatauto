const db = require('../../libs/db');
const {
    costsCategories: costsCategoriesModel,
    drivers: driversModel,
    suppliersDealsModel,
    customersModel,
} = require('../../models');

module.exports = async (req, res, next) => {

    const costs = await db.execQuery(`
        SELECT c.*,
            cc.title as category,
            s.name as supplier_name,
            d.name as driver_name,
            cs.name as cashbox_name
        FROM costs c
            LEFT JOIN costs_categories cc ON cc.id = c.category_id
            LEFT JOIN suppliers s ON s.id = c.supplier_id
            LEFT JOIN drivers d ON d.id = c.driver_id
            LEFT JOIN cash_storages cs ON cs.id = c.cash_storage_id
    `);

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations`);
    const customers = await db.execQuery(`SELECT *, CONCAT('CUST-', id) as code FROM customers`);

    const suppliers = await db.execQuery(`SELECT * FROM suppliers`);

    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);
    const costsCategories = await costsCategoriesModel.get();

    const deals = await suppliersDealsModel.get({ paid: false });
    
    const drivers = await driversModel.get();
    const contracts = await db.execQuery(`SELECT * FROM muz_contracts`);
    const cars = await db.execQuery(`SELECT * FROM cars`);
    const apartments = await db.execQuery(`SELECT * FROM apartments`);

    costs.forEach(item => {
        item.base = item.base_id || item.base_other;
    });

    contracts.forEach(contract => {
        contract.code = `MUZ-${contract.id}`;
    });

    for (const cost of costs) {

        const { code, document_id: documentId } = cost;

        let toCost = '';

        if (code === 'CRR') {
            const [CRR] = await db.execQuery(`SELECT * FROM cars_reservations WHERE id = ?`, [documentId]);

            if (!CRR)
                continue;

            const [customer] = await customersModel.get({ id: CRR.customer_id });

            if (!customer)
                continue;

            toCost = customer.name;
        } else if (code === 'APR') {
            const [APR] = await db.execQuery(`SELECT * FROM apartment_reservations WHERE id = ?`, [documentId]);

            if (!APR)
                continue;

            const [customer] = await customersModel.get({ id: APR.customer_id });

            if (!customer)
                continue;

            toCost = customer.name;
        } else if (code === 'MUZ') {
            const [MUZ] = await db.execQuery(`SELECT * FROM muz_contracts WHERE id = ?`, [documentId]);

            if (!MUZ)
                continue;

            const [customer] = await customersModel.get({ id: MUZ.customer_id });

            if (!customer)
                continue;

            toCost = customer.name;
        } else if (code === 'CAR') {
            const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [documentId]);

            if (!car)
                continue;

            toCost = `${car.name} ${car.model} - ${car.number}`;
        } else if (code === 'SD') {
            const [supplierDeal] = await db.execQuery(`SELECT * FROM suppliers_deals WHERE id = ?`, [documentId]);

            if (!supplierDeal)
                continue;

            const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [documentId]);

            if (!supplier)
                continue;

            toCost = supplier.name;
        }


        if (cost.supplier_id) {
            const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [cost.supplier_id]);

            if (!supplier)
                continue;

            toCost = supplier.name;
        }

        if (cost.driver_id) {
            const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [cost.driver_id]);

            if (!driver)
                continue;

            toCost = driver.name;
        }

        if (cost.customer_id) {
            const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [cost.customer_id]);

            if (!customer)
                continue;

            toCost = customer.name;
        }

        cost.toCost = toCost;
    }

    const groupDocuments = [
        { label: 'Аренда автомобилей', documents: carReservations, },
        { label: 'Аренда квартир', documents: apartmentReservations, },
        { label: 'Заказчики', documents: customers, },
        { label: 'Сделки с поставщиками', documents: deals, },
        { label: 'Контракты', documents: contracts, },
    ];

    res.render(__dirname + '/costs-list', {
        costs,
        groupDocuments,
        cashStorages,
        customers,
        contracts,
        costsCategories,
        drivers,
        suppliers,
        cars,
        apartments,
    });
}