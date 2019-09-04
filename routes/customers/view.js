const db = require('../../libs/db');
const {
    customersModel
} = require('../../models')

module.exports = async (req, res, next) => {
    const { id } = req.params;
    const customers = await customersModel.get({ id });

    res.render(__dirname + '/customer-view.hbs', { customers });
}