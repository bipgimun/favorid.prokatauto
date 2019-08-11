const db = require('../../libs/db');

exports.get = ({
    id = '',
    code = '',
    documentId = '',
    customerId = '',
    isPaid = null,
} = {}) => {

    return db.execQuery(`
        SELECT i.*,
            c.name as customer_name
        FROM invoices i
            LEFT JOIN customers c ON c.id = i.customer_id
        WHERE i.id > 0
            ${id ? `AND i.id = ${id}` : ''}
            ${documentId ? `AND i.document_id = ${documentId}` : ''}
            ${code ? `AND i.code = ${code}` : ''}
            ${customerId ? `AND i.customer_id = ${customerId}` : ''}
            ${isPaid === true ? `AND i.closed IS NOT NULL` : ''}
            ${isPaid === false ? `AND i.closed IS NULL` : ''}
    `);
};

exports.update = ({ id, ...values }) => {

    if (!id)
        throw new Error('invoiceUpdate: Отсутствует id');

    if (!Object.keys(values))
        throw new Error('invoiceUpdate: Отсутствуют поля для обновления');

    return db.execQuery(`UPDATE invoices SET ? WHERE id = ?`, [values, id]);
};

exports.add = ({
    customer_id = null,
    sum = null,
    code = null,
    base_id = null,
    manager_id = null,
} = {}) => {

    if (!customer_id)
        throw new Error('Отсутствует customer_id');

    if (!sum)
        throw new Error('Отсутствует sum');

    if (!code)
        throw new Error('Отсутствует code');

    if (!base_id)
        throw new Error('Отсутствует base_id');

    if (!manager_id)
        throw new Error('Отсутствует manager_id');

    return db.insertQuery(`INSERT INTO invoices SET ?`, { customer_id, sum, code, base_id, manager_id });
};