const db = require('../../libs/db');

exports.add = ({
    detailing_id,
    reserv_id,
} = { detailing_id, reserv_id }) => {

    if (!detailing_id)
        throw new Error('Отсутствует detailing_id');

    if (!reserv_id)
        throw new Error('Отсутствует reserv_id');

    return db.insertQuery(`INSERT INTO detailing_cars_details SET ?`, { detailing_id, reserv_id });
}

exports.get = ({ reserv_id = '', detailing_id = '' } = {}) => {
    return db.execQuery(`
        SELECT *
        FROM detailing_cars_details
        WHERE id > 0
            ${reserv_id ? `AND reserv_id = ${reserv_id}` : ''}
            ${detailing_id ? `AND detailing_id = ${detailing_id}` : ''}
    `);
};