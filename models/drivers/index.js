const db = require('../../libs/db');

exports.get = () => {
    return db.execQuery(`SELECT * FROM drivers`);
}