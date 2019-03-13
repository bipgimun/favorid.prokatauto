const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const goods = await db.execQuery(`SELECT id, title FROM goods`);

    return res.render(__dirname + '/sales', { goods });
};