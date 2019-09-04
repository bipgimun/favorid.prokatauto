const db = require('../../libs/db');
const Joi = require('joi');

class SuppliersDeals {
    constructor() {
        this.id = null;
        this.supplier_id = null;
        this.position_id = null;
        this.sum = null;
        this.manager_id = null;
        this.date = null;
        this.created_at = null;
        this.supplier_name = null;
        this.position_name = null;
        this.is_paid = null;
        this.paid_at = null;
        this.paid_sum = null;
    }
}

/** 
 * @returns {Promise<SuppliersDeals[]>}
 */
exports.get = ({
    id = '',
    ids = '',
    paid = null
} = {}) => {

    return db.execQuery(`
        SELECT sd.*,
            s.name as supplier_name,
            sp.name as position_name,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name,
            CONCAT('SD-', sd.id) as code
        FROM suppliers_deals sd
            LEFT JOIN suppliers s ON s.id = sd.supplier_id
            LEFT JOIN suppliers_positions sp ON sp.id = sd.position_id
            LEFT JOIN employees e ON e.id = sd.manager_id
        WHERE sd.id > 0
            ${id ? `AND sd.id = ${id}` : ``}
            ${ids ? `AND sd.id IN (${ids})` : ``}
            ${paid === true ? `AND sd.is_paid = 1` : ``}
            ${paid === false ? `AND sd.is_paid = 0` : ``}
    `);
}

exports.add = (args = {}) => {
    return db.insertQuery(`INSERT INTO suppliers_deals SET ?`, args);
}

exports.update = ({ id = '', values = {} } = {}) => {

    if (!id)
        throw new Error('Model "suppliers-deal" update: missing id');

    return db.execQuery(`UPDATE suppliers_deals SET ? WHERE id = ?`, [values, id]);
}

exports.delete = ({ id }) => {

    if (!id)
        throw new Error('Model "suppliers-deal" delete: missing id')

    return db.execQuery(`DELETE FROM suppliers_deals WHERE id = ?`, [id]);
}