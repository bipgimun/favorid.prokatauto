const router = require('express').Router();
const db = require('../../libs/db');

router.get('/closed', async (req, res, next) => {

    const notifications = await db.execQuery(`
        SELECT n.*,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM notifications n
            LEFT JOIN employees e ON n.manager_id = e.id
        WHERE n.is_closed = 1
    `);

    for (const notification of notifications) {

        notification.title = '';
        notification.description = '';

        if (notification.target_type == 'osago_expiration') {
            notification.title = 'ОСАГО подходит к концу';
            notification.description = 'Уточните и внесите обновленную дату ОСАГО у ';

            const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [notification.target_id]);

            if (!car) {
                continue;
            }

            notification.description += `<a href="/cars/${notification.target_id}">${car.name} ${car.model} ${car.number}</a>`;

        } else if (notification.target_type == 'leasing_expiration') {
            notification.title = 'Окончание лизинга';
            notification.description = 'В связи с окончанием лизинга, в назначенную дату измените статус у ';

            const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [notification.target_id]);

            if (!car) {
                continue;
            }

            notification.description += `<a href="/cars/${notification.target_id}">${car.name} ${car.model} ${car.number}</a>`;

        } else if (notification.target_type == 'payment_close') {
            notification.title = 'Платеж по лизингу';
            notification.description = 'Оплатите и внесите обновленную дату платежа у ';

            const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [notification.target_id]);

            if (!car) {
                continue;
            }

            notification.description += `<a href="/cars/${notification.target_id}">${car.name} ${car.model} ${car.number}</a>`;


        } else if (notification.target_type == 'license_expiration') {
            notification.title = 'Окончание водительского удостоверения';
            notification.description = 'В связи с окончанием действия водительсого удостоверения, предупредите, запросите номер нового и измените его у ';
            
            const [driver] = await db.execQuery('`SELECT * FROM drivers WHERE id = ?', [notification.target_id]);

            if(!driver) {
                continue;
            }
            
            notification.description += `<a href="/drivers/${driver.id}">${driver.name}</a>`;

        } else if (notification.target_type == 'passenger_birthday') {
            notification.title = 'День рождения у клиента';

            const [passenger] = await db.execQuery(`SELECT * FROM passengers WHERE id = ?`, [notification.target_id]);

            if(!passenger) {
                continue;
            }

            notification.description = `Не забудьте поздравить, у <a href="/clients/${passenger.id}">${passenger.name}</a> день рождения`;

        } else if (notification.target_type == 'customer_birthday') {
            notification.title = 'День рождения у заказчика';
            
            const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [notification.target_id]);
            
            
            notification.description = `Не забудьте поздравить, у <a href="/customers/${customer.id}">${customer.name}</a> день рождения`;

        }
    }

    res.render(__dirname + '/notifications.hbs', {
        notifications,
        is_closed: 1
    });
})

router.get('/', async (req, res, next) => {

    const notifications = await db.execQuery(`SELECT * FROM notifications WHERE is_closed = 0`);

    for (const notification of notifications) {

        notification.title = '';
        notification.description = '';

        if (notification.target_type == 'osago_expiration') {
            notification.title = 'ОСАГО подходит к концу';
            notification.description = 'Уточните и внесите обновленную дату ОСАГО у ';

            const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [notification.target_id]);

            if (!car) {
                continue;
            }

            notification.description += `<a href="/cars/${notification.target_id}">${car.name} ${car.model} ${car.number}</a>`;

        } else if (notification.target_type == 'leasing_expiration') {
            notification.title = 'Окончание лизинга';
            notification.description = 'В связи с окончанием лизинга, в назначенную дату измените статус у ';

            const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [notification.target_id]);

            if (!car) {
                continue;
            }

            notification.description += `<a href="/cars/${notification.target_id}">${car.name} ${car.model} ${car.number}</a>`;

        } else if (notification.target_type == 'payment_close') {
            notification.title = 'Платеж по лизингу';
            notification.description = 'Оплатите и внесите обновленную дату платежа у ';

            const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [notification.target_id]);

            if (!car) {
                continue;
            }

            notification.description += `<a href="/cars/${notification.target_id}">${car.name} ${car.model} ${car.number}</a>`;


        } else if (notification.target_type == 'license_expiration') {
            notification.title = 'Окончание водительского удостоверения';
            notification.description = 'В связи с окончанием действия водительсого удостоверения, предупредите, запросите номер нового и измените его у ';
            
            const [driver] = await db.execQuery('SELECT * FROM drivers WHERE id = ?', [notification.target_id]);

            if(!driver) {
                continue;
            }
            
            notification.description += `<a href="/drivers/${driver.id}">${driver.name}</a>`;

        } else if (notification.target_type == 'passenger_birthday') {
            notification.title = 'День рождения у клиента';

            const [passenger] = await db.execQuery(`SELECT * FROM passengers WHERE id = ?`, [notification.target_id]);

            if(!passenger) {
                continue;
            }

            notification.description = `Не забудьте поздравить, у <a href="/clients/${passenger.id}">${passenger.name}</a> день рождения`;

        } else if (notification.target_type == 'customer_birthday') {
            notification.title = 'День рождения у заказчика';
            
            const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [notification.target_id]);
            
            
            notification.description = `Не забудьте поздравить, у <a href="/customers/${customer.id}">${customer.name}</a> день рождения`;

        }
    }

    res.render(__dirname + '/notifications.hbs', {
        notifications
    });
})

module.exports = router;