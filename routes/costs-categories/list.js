const db = require('../../libs/db');
const { costsCategories: costsCategoriesModel } = require('../../models');

module.exports = async (req, res, next) => {

    const costsCategories = await costsCategoriesModel.get();

    res.render(__dirname + '/costs-categories-list', { costsCategories });
}