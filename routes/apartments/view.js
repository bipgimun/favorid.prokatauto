const db = require('../../libs/db');

const APARTMENT_STATUS = require('../../config/apartment-statuses');

module.exports = async (req, res, next) => {
    const { id } = req.params;

    const apartments = await db.execQuery(`
        SELECT a.*,
            ar.status
        FROM apartments a
            LEFT JOIN apartment_reservations ar ON ar.apartment_id = a.id
        WHERE a.id = ?`, [id]
    );

    apartments.forEach((a) => {
        a.status = a.status || 0;
        a.status_name = APARTMENT_STATUS.get(a.status);
        a.owned_name = a.apartment_owned == '1' ? 'Принадлежит' : 'Не принадлежит';
    });

    

    res.render(__dirname + '/apartments-view.hbs', { apartments });
}