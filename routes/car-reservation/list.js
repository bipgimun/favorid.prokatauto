const db = require('../../libs/db');

const statues = {
    '0': 'Новая заявка',
    '1': 'В работе',
    '2': 'Завершена'
};

const { carsReservsModel } = require('../../models');

module.exports = async (req, res, next) => {

    const isArchive = req.route.path === '/archive';

    const additionalServices = await db.execQuery(`SELECT * FROM additional_services`);

    const reservs = await carsReservsModel.get({ isArchive });

    reservs.forEach(item => {
        item.status_name = statues[String(item.status)];
        item.orange = item.has_driver == '1' && !item.driver_id;
    })

    const customers = await db.execQuery(`SELECT * FROM customers`);

    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const itineraries = await db.execQuery('SELECT * FROM itineraries');
    const drivers = await db.execQuery('SELECT * FROM drivers');

    res.render(__dirname + '/car-reservation-list', {
        reservs,
        customers,
        passengers,
        itineraries,
        drivers,
        isArchive,
        additionalServices
    });
}