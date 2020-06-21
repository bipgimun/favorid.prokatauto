const db = require('../../libs/db');

const statues = {
    '0': 'Новая заявка',
    '1': 'В работе',
    '2': 'Завершена'
};

const {
    carsReservsModel,
    customersModel
} = require('../../models');

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

    const incomes = await db.execQuery(`SELECT * FROM incomes WHERE base_id = ?`, [`CRR-${reservation.id}`]);
    const incomesSum = +incomes.reduce((acc, item) => +acc + +item.sum, 0) + +reservation.paid_sum;
    
    reservation.paid_sum = incomesSum;
    

    reservs.forEach(item => {
        item.status_name = statues[String(item.status)];
        item.completed = item.status == '2';

        item.can_edit = false;

        item.reserv_fuel_level = item.reserv_fuel_level || item.car_fuel_level;
        item.reserv_mileage = item.reserv_mileage || item.car_mileage;

        if (req.session.user.is_director == '1') {
            item.can_edit = true;
        } else if (!item.completed && req.session.user.is_senior_manager == '1') {
            item.can_edit = true;
        }
    })

    const customers = await customersModel.get();
    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const drivers = await db.execQuery('SELECT * FROM drivers ORDER BY name ASC');
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