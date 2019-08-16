const db = require('../../libs/db');

const APARTMENT_STATUS = require('../../config/apartment-statuses');
const {
    apartmentsReservsModel,
    customersModel
} = require('../../models');

module.exports = async (req, res, next) => {

    const isArchive = req.route.path === '/archive';

    const passengers = await db.execQuery(`SELECT * FROM passengers`);
    const apartments = await db.execQuery(`SELECT * FROM apartments`);
    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);
    const additionalServices = await db.execQuery(`SELECT * FROM additional_services`);

    const apartmentReservations = await apartmentsReservsModel.get({ isArchive });
    apartmentReservations.forEach(item => {
        item.statusName = APARTMENT_STATUS.get(item.status);
    });

    const customers = await customersModel.get();

    return res.render(__dirname + '/apartment-reservations', {
        customers,
        passengers,
        apartments,
        cashStorages,
        additionalServices,
        apartmentReservations,
        isArchive,
    });
};