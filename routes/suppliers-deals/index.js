const router = require('express').Router();

const db = require('../../libs/db');

const {
    suppliersDealsModel,
    drivers: driversModel,
} = require('../../models');

router.get('/', async (req, res, next) => {

    const deals = await suppliersDealsModel.get({ paid: false });

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations`);

    const drivers = await driversModel.get();
    const contracts = await db.execQuery(`SELECT * FROM muz_contracts`);
    const cars = await db.execQuery(`SELECT * FROM cars`);
    const apartments = await db.execQuery(`SELECT * FROM apartments`);

    return res.render(__dirname + '/suppliers-deals-list', {
        deals,
        carReservations,
        apartmentReservations,
        drivers,
        contracts,
        cars,
        apartments,
    })
})

router.get('/paid', async (req, res, next) => {

    const deals = await suppliersDealsModel.get({ paid: true });

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations`);
    const drivers = await driversModel.get();
    const contracts = await db.execQuery(`SELECT * FROM muz_contracts`);
    const cars = await db.execQuery(`SELECT * FROM cars`);
    const apartments = await db.execQuery(`SELECT * FROM apartments`);

    return res.render(__dirname + '/suppliers-deals-list', {
        deals,
        carReservations,
        apartmentReservations,
        drivers,
        contracts,
        cars,
        apartments,
        paid: true
    })
})

router.get('/:id', async (req, res, next) => {

    const [document] = await suppliersDealsModel.get({ id: req.params.id });

    if (!document)
        throw new Error('Сделка не найдена');


    const costsByDeal = await db.execQuery(`SELECT sum FROM costs WHERE code = ? AND document_id = ?`, ['SD', document.id]);
    const costsSum = costsByDeal.reduce((acc, value) => +acc + +value.sum, 0);

    const remainderCalc = (document.sum - costsSum);
    const reminder = remainderCalc >= 0
        ? remainderCalc
        : 0;

    const details = await db.execQuery(`SELECT * FROM suppliers_deals_details WHERE suppliers_deal_id = ?`, [document.id]);

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
            }
        }
    }
    

    const cars = await db.execQuery(`SELECT * FROM cars`);
    const apartments = await db.execQuery(`SELECT * FROM apartments`);
    const drivers = await db.execQuery(`SELECT * FROM drivers ORDER BY name ASC`);
    const contracts = await db.execQuery(`SELECT * FROM muz_contracts`);
    const carsReservs = await db.execQuery('SELECT * FROM cars_reservations');

    return res.render(__dirname + '/suppliers-deals-view', {
        document,
        cars,
        apartments,
        drivers,
        contracts,
        carsReservs,
        grouppedDetails,
        reminder,
        can_edit: req.session.user.is_director == '1' || req.session.user.is_senior_manager == '1' && document.is_paid == '1'
    })
})

module.exports = router;