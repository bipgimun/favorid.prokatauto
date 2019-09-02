const db = require('../../libs/db');
const {
    customersModel
} = require('../../models');

module.exports = async (req, res, next) => {

    const customers = (await customersModel.get())
        .map(item => {
            item.is_legal_entity = item.is_legal_entity == '1' ? 'Юридическое лицо' : 'Физ. лицо';
            return item;
        })

    res.render(__dirname + '/customers-list', { customers });
}