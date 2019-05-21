const db = require('../../libs/db');

exports.get = () => {
    return db.execQuery(`SELECT * FROM invoices`);
};

exports.add = ({
    customer_id,
    sum,
    code,
    base_id,
} = { customer_id, sum, code, base_id }) => {

    if (!customer_id)
        throw new Error('Отсутствует customer_id');

    if (!sum)
        throw new Error('Отсутствует sum');

    if (!code)
        throw new Error('Отсутствует code');

    if (!base_id)
        throw new Error('Отсутствует base_id');

    return db.insertQuery(`INSERT INTO invoices SET ?`, { customer_id, sum, code, base_id });
};