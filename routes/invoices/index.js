const router = require('express').Router();

const {
    invoicesModel,
    detailingApartmentsModel,
    detailingCarsModel,
} = require('../../models');
const db = require('../../libs/db');

router.get('/', async (req, res, next) => {

    const invoices = await invoicesModel.get();

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations`);

    const detailingCars = (await detailingCarsModel.get())
        .map(item => (item.code = 'DET-A-' + item.id, item));

    const detailingApartments = (await detailingApartmentsModel.get())
        .map(item => (item.code = 'DET-K-' + item.id, item));

    const groupDocuments = [
        { label: 'Детализация автомобилей', documents: detailingCars },
        { label: 'Детализация квартир', documents: detailingApartments },
        { label: 'Аренда автомобилей', documents: carReservations, },
        { label: 'Аренда квартир', documents: apartmentReservations, }
    ];

    res.render(__dirname + '/template.hbs', { invoices, groupDocuments });
});

module.exports = router;