const db = require('../../libs/db');

exports.add = ({
    reserv_id = '',
    detailing_id = ''
} = { reserv_id, detailing_id }) => {
    return db.insertQuery(`INSERT INTO detailing_apartments_details SET ?`, { reserv_id, detailing_id });
};


exports.get = ({ id = '', detailing_id = '', reserv_id = '' } = {}) => {
    return db.execQuery(`
        SELECT dad.*
        FROM detailing_apartments_details dad
        WHERE
            dad.id > 0
            ${id ? `AND dad.id = ${id}` : ``}
            ${reserv_id ? `AND dad.reserv_id = ${reserv_id}` : ``}
            ${detailing_id ? `AND dad.detailing_id = ${detailing_id}` : ``}
    `);
};