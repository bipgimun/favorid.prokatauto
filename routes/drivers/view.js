const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const { id } = req.params;

    const drivers = await db.execQuery(`
        SELECT d.*,
            CONCAT(c.name, ' ', c.model) as car_name
        FROM drivers d
            LEFT JOIN cars c ON c.id = d.car_id
        WHERE d.id = ?`, [id]
    );

    const cars = await db.execQuery(`SELECT * FROM cars`);

    const [driver = {}] = drivers;

    cars.forEach(car => {
        car.selected = car.id == driver.car_id;
    })

    res.render(__dirname + '/drivers-view', { drivers, cars });
}