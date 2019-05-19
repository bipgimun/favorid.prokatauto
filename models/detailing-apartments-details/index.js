const db = require('../../libs/db');

exports.add = ({
    reserv_id = '',
    detailing_id = ''
} = { reserv_id, detailing_id }) => {
    return db.insertQuery(`INSERT INTO detailing_apartments_details SET ?`, { reserv_id, detailing_id });
};