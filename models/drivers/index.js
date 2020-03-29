const db = require('../../libs/db');

exports.get = ({ id = '', search = '' } = {}) => {
    return db.execQuery(`
        SELECT * 
        FROM drivers
        WHERE
            id > 0
            ${id ? `AND id = ${id}` : ``}
            AND name LIKE '%${search}%'
        ORDER BY name ASC
    `);
}