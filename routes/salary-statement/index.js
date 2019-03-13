const db = require('../../libs/db');

module.exports = async (req, res, next) => {
    const employees = await db.execQuery(`SELECT * FROM employees`);
    res.render(__dirname + '/salary-statement', { employees });
}