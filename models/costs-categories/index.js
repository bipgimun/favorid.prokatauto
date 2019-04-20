const db = require('../../libs/db');

exports.add = async ({ title = '' }) => {
    return db.insertQuery(`INESRT INTO costs_categories SET ?`, [{ title }]);
}

exports.get = ({
    id = ''
}) => {
    return db.execQuery(`
        SELECT * 
        FROM costs_categories
        WHERE
            id > 0
            ${id ? `AND id = ${id}` : ''}
    `);
}

exports.update = ({ id, ...values }) => {

    if (!id)
        throw new Error('Отсутствует id для обновления');

    if (!Object.keys(values))
        throw new Error('Отсутствуют данные для обновления');

    return db.execQuery(`UPDATE costs_categories SET ? WHERE id = ?`, [id, values]);
}

exports.delete = ({ id }) => {
    if (!id)
        throw new Error('Отсутствует id для удаления');

    return db.execQuery(`DELETE FROM costs_categories WHERE id = ?`, [id]);
};