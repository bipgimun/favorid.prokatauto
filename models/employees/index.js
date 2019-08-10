const db = require('../../libs/db');

exports.get = function ({
    id = ''
} = {}) {
    return db.execQuery(`
        SELECT e.*
        FROM employees e
        WHERE
            e.id > 0
            ${id ? `AND e.id = ${id}` : ``}
    `);
}

exports.add = (data = {}) => {

    if (Object.keys(data).length < 1) {
        throw new Error('Отсутствуют данные для обновления');
    }

    return db.insertQuery(`INSERT INTO employees SET ?`, data);
}