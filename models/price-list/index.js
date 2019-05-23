const db = require('../../libs/db');

exports.get = ({ id = '' } = {}) => {
    return db.execQuery(`
        SELECT * 
        FROM cars_price
        WHERE id > 0
            ${id ? `AND id = ${id}` : ''}
    `);
};