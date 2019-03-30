const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const customers = (await db.execQuery(`SELECT * FROM customers`))
        .map(item => {
            item.is_legal_entity = item.is_legal_entity == '1' ? 'Юридическре лицо' : 'Физ. лицо';
            return item;
        })

    res.render(__dirname + '/customers-list', { customers });
}