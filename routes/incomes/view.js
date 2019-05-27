const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    const incomes = await db.execQuery(`
        SELECT i.*,
            cs.name as cashbox_name
        FROM incomes i
            LEFT JOIN cash_storages cs ON cs.id = i.cash_storage_id 
        WHERE i.id = ?
    `, [id]);

    if (!incomes.length) {
        throw new Error('Страница не найдена или была удалена')
    }

    const carReservations = await db.execQuery(`SELECT *, CONCAT('CRR-', id) as code FROM cars_reservations`);
    const apartmentReservations = await db.execQuery(`SELECT *, CONCAT('APR-', id) as code FROM apartment_reservations`);

    const cashStorages = await db.execQuery(`SELECT * FROM cash_storages`);

    incomes.forEach(item => {
        item.base = item.base_id || item.base_other;
        item.link = item.code === 'CRR'
            ? '/car-reservation' : (item.code === 'APR'
                ? '/apartment-reservations' : (item.code === 'pd'
                    ? '/invoices'
                    : ''));
    })

    const groupDocuments = [
        { label: 'Аренда автомобилей', documents: carReservations, },
        { label: 'Аренда квартир', documents: apartmentReservations, }
    ];

    res.render(__dirname + '/incomes-view', {
        incomes,
        groupDocuments,
        cashStorages,
        id
    });
}