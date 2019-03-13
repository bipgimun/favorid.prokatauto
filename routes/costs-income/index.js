const db = require('../../libs/db');

module.exports = async (req, res, next) => {
    const costsCategories = await db.execQuery(`SELECT id, title FROM costs_categories`);
    return res.render(__dirname + '/costs-income', { costsCategories });
};