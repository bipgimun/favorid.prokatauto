const db = require('../../libs/db');

exports.get = ({ id = '', search = '' } = {}) => {
    return db.execQuery(`
        SELECT sp.*
        FROM suppliers_positions sp
        WHERE sp.id > 0
            ${id && `AND sp.id = ${id}`}
            ${search && `AND sp.name LIKE '%${search}%'`}
    `);
}

exports.add = (args) => {
    return db.insertQuery(`INSERT INTO suppliers_positions SET ?`, [args]);
}

exports.update = ({ id = '', values = {} } = {}) => {
    return db.execQuery(`UPDATE suppliers_positions SET ? WHERE id = ?`, [values, id]);
}

exports.delete = ({ id }) => {
    return db.execQuery(`DELETE FROM suppliers_positions WHERE id = ?`, [id]);
}