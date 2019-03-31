const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const storages = (await db.execQuery(`SELECT * FROM cash_storages`))
        .map(item => {
            item.cashbox_title = String(item.cashbox) === '1' ? 'Касса' : 'Счёт';

            return item;
        });

    res.render(__dirname + '/cash-storages-list', { storages });
}