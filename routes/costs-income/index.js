const {costsCategories: costsCategoriesModel} = require('../../models');

module.exports = async (req, res, next) => {
    const costsCategories = await costsCategoriesModel.get();
    return res.render(__dirname + '/costs-income', { costsCategories });
};