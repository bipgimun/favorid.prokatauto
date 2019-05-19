const db = require('../../libs/db');

exports.get = () => {
    return db.execQuery(`SELECT * FROM invoices`);
};

exports.add = ({
    customer_id,
    sum,
} = { customer_id, sum }) => {
    return db.insertQuery(`INSERT INTO invoices SET ?`, { customer_id, sum });
};