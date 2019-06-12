const { costsCategories: costsCategoriesModel } = require('../../models');

module.exports = async (req, res, next) => {

    const { id } = req.params;


    if (!id || !Number(id))
        throw new Error('Неверный id');

    const [costsCategories = {}] = await costsCategoriesModel.get({ id });

    res.render(__dirname + '/costs-categories-view.hbs', { id, cat: costsCategories });
}