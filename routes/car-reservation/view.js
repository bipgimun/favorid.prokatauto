const db = require('../../libs/db');

const statues = {
    '0': 'Новая заявка',
    '1': 'В работе',
    '2': 'Завершена'
};

const { carsReservsModel } = require('../../models');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    if (!Number(id))
        throw new Error('Неверный id');

    const reservs = await carsReservsModel.get({ id })

    const [reservation = {}] = reservs;

    if (!reservation.id)
        throw new Error('Страница не найдена');

    const servicesList = await db.execQuery(`SELECT * FROM additional_services`);

    const additionalServices = (reservation.services || '')
        .split(',')
        .filter(item => !!item)
        .map(item => servicesList.find(service => service.id == item));

    reservs.forEach(item => {
        item.status_name = statues[String(item.status)];
        item.completed = item.status == '2';

        item.can_edit = false;

        if (req.session.user.is_director == '1') {
            item.can_edit = true;
        } else if (!item.completed && req.session.user.is_senior_manager == '1') {
            item.can_edit = true;
        }
    })

    const customers = await db.execQuery(`SELECT * FROM customers`);
    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const drivers = await db.execQuery('SELECT * FROM drivers');
    const cars = await db.execQuery('SELECT * FROM cars');
    const itineraries = await db.execQuery('SELECT * FROM itineraries');

    res.render(__dirname + '/car-reservation-view', {
        reservs,
        customers,
        passengers,
        drivers,
        cars,
        itineraries,
        id,
        item: reservs[0],
        additionalServices,
        servicesList
    });
}