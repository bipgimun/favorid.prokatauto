const db = require('../../libs/db');
const APARTMENT_STATUS = require('../../config/apartment-statuses');

module.exports = async (req, res, next) => {

    const apartments = await db.execQuery(`
        SELECT a.*,
            ar.status 
        FROM apartments a
            LEFT JOIN apartment_reservations ar ON ar.apartment_id = a.id
    `);

    apartments.forEach(a => {
        a.status = a.status || 0;
        a.statusName = APARTMENT_STATUS.get(a.status);
    })

    res.render(__dirname + '/apartments.hbs', { apartments });
}