const { costsCategories: costsCategoriesModel } = require('../../models');

module.exports = async (req, res, next) => {

    const { id } = req.params;
    const costsCategories = await costsCategoriesModel.get({ id });

    res.render(__dirname + '/costs-categories-view.hbs', { cars: costsCategories });
}