const express = require('express');
const app = express.Router();

const moment = require('moment');

const db = require('../../../libs/db');

app.get('/get-preview', async (req, res, next) => {

    const openExistsNotifications = await db.execQuery(`SELECT * FROM notifications`);

    const currDate = moment();
    const currDateFormatted = currDate.format('YYYY-MM-DD');

    const nowPlus10Days = currDate.add(10, 'd');
    const nowPlus10DaysFormated = nowPlus10Days.format('YYYY-MM-DD');

    // авто у которых близится дата окончания осаго
    const osagoExpiration = (await db.execQuery(`SELECT c.* FROM cars c WHERE osago_expiration_date BETWEEN ? AND ?`, [currDateFormatted, nowPlus10DaysFormated]))
        .filter(item =>
            !openExistsNotifications.find(
                n => n.target_type === 'osago_expiration'
                    && n.target_id == item.id
                    && new Date(n.target_date).getTime() == new Date(item.osago_expiration_date).getTime()
            )
        );

    // создание уведомлений
    for (const item of osagoExpiration) {
        await db.insertQuery(`INSERT INTO notifications SET ?`, [{ target_type: 'osago_expiration', target_id: item.id, target_date: item.osago_expiration_date }]);
    }


    // авто у которых близится окончание лизинга
    const leasingExpiration = (await db.execQuery(`SELECT c.* FROM cars c WHERE leasing_expiration_date BETWEEN ? AND ?`, [currDateFormatted, nowPlus10DaysFormated]))
        .filter(item =>
            !openExistsNotifications.find(
                n => n.target_type === 'leasing_expiration'
                    && n.target_id == item.id
                    && new Date(n.target_date).getTime() == new Date(item.leasing_expiration_date).getTime()
            )
        );

    // создание уведомлений
    for (const item of leasingExpiration) {
        await db.insertQuery(`INSERT INTO notifications SET ?`, [{ target_type: 'leasing_expiration', target_id: item.id, target_date: item.leasing_expiration_date }]);
    }

    // авто у которых близка дата платежа
    const paymentClose = (await db.execQuery(`SELECT c.* FROM cars c WHERE payment_date BETWEEN ? AND ?`, [currDateFormatted, nowPlus10DaysFormated]))
        .filter(item =>
            !openExistsNotifications.find(
                n => n.target_type === 'payment_close'
                    && n.target_id == item.id
                    && new Date(n.target_date).getTime() == new Date(item.payment_date).getTime()
            )
        );

    // создание уведомлений
    for (const item of paymentClose) {
        await db.insertQuery(`INSERT INTO notifications SET ?`, [{ target_type: 'payment_close', target_id: item.id, target_date: item.payment_date }]);
    }

    // водители у которых близка дата окончания вод. удостоверения
    const licenseExpiration = (await db.execQuery(`SELECT * FROM drivers WHERE license_date_expiration BETWEEN ? AND ?`, [currDateFormatted, nowPlus10DaysFormated]))
        .filter(item =>
            !openExistsNotifications.find(
                n => n.target_type === 'license_expiration'
                    && n.target_id == item.id
                    && new Date(n.target_date).getTime() == new Date(item.license_date_expiration).getTime()
            )
        );

    // создание уведомлений
    for (const item of licenseExpiration) {
        await db.insertQuery(`INSERT INTO notifications SET ?`, [{ target_type: 'license_expiration', target_id: item.id, target_date: item.license_date_expiration }]);
    }

    // клиенты у которых скоро день рождения
    const passengersBirthday = (await db.execQuery(`
        SELECT * 
        FROM passengers 
        WHERE birthday IS NOT NULL 
            AND DAYOFYEAR(birthday) - DAYOFYEAR(?) <= 10
            AND DAYOFYEAR(birthday) - DAYOFYEAR(?) >= 0
        `, [currDateFormatted, currDateFormatted]
    )).filter(item =>
        !openExistsNotifications.find(
            n => n.target_type === 'passenger_birthday'
                && n.target_id == item.id
                && moment(n.target_date).format('YYYY-MM-DD') == moment(item.birthday).set({ year: new Date().getFullYear() }).format('YYYY-MM-DD')
        )
    );

    // создание уведомлений
    for (const item of passengersBirthday) {
        await db.insertQuery(`INSERT INTO notifications SET ?`, [{
            target_type: 'passenger_birthday',
            target_id: item.id,
            target_date: moment(item.birthday).set({ year: new Date().getFullYear() }).format('YYYY-MM-DD')
        }]);
    }

    // клиенты у которых скоро день рождения
    const customersBirthday = (await db.execQuery(`
        SELECT * 
        FROM customers 
        WHERE birthday IS NOT NULL 
            AND DAYOFYEAR(birthday) - DAYOFYEAR(?) <= 10
            AND DAYOFYEAR(birthday) - DAYOFYEAR(?) >= 0
        `, [currDateFormatted, currDateFormatted]
    )).filter(item =>
        !openExistsNotifications.find(
            n => n.target_type === 'customer_birthday'
                && n.target_id == item.id
                && moment(n.target_date).format('YYYY-MM-DD') == moment(item.birthday).set({ year: new Date().getFullYear() }).format('YYYY-MM-DD')
        )
    );

    // создание уведомлений
    for (const item of customersBirthday) {
        await db.insertQuery(`INSERT INTO notifications SET ?`, [{
            target_type: 'customer_birthday',
            target_id: item.id,
            target_date: moment(item.birthday).set({ year: new Date().getFullYear() }).format('YYYY-MM-DD')
        }]);
    }

    const notifications = (await db.execQuery(`SELECT * FROM notifications WHERE is_closed = 0 ORDER BY target_date`));


    notifications.forEach(item => {
        item.title = '';

        if (item.target_type == 'osago_expiration') {
            item.title = 'ОСАГО подходит к концу';
        } else if (item.target_type == 'leasing_expiration') {
            item.title = 'Окончание лизинга';
        } else if (item.target_type == 'payment_close') {
            item.title = 'Платеж по лизингу';
        } else if (item.target_type == 'license_expiration') {
            item.title = 'Окончание водительского удостоверения';
        } else if (item.target_type == 'passenger_birthday') {
            item.title = 'День рождения у клиента';
        } else if (item.target_type == 'customer_birthday') {
            item.title = 'День рождения у заказчика';
        }
    });

    res.render('partials/notifications-preview', {
        layout: false,
        notifications,
        count: notifications.length
    }, (error, html) => {

        if (error)
            return res.json({ status: 'bad', body: error.message });

        res.json({
            status: 'ok',
            count: notifications.length,
            html
        });
    });
})

app.post('/take-work', async (req, res, next) => {

    const { id } = req.body;
    const { employee_id: manager_id } = req.session.user;

    const [notification] = await db.execQuery(`SELECT * FROM notifications WHERE id = ?`, [id]);

    if(!notification) {
        throw new Error('Уведомление не найдено');
    }

    if(notification.manager_id) {
        throw new Error('Уведомление уже взято в работу другим сотрудником. Посмотрите в списке обработанных уведомлений');
    }

    await db.execQuery(`UPDATE notifications SET ? WHERE id = ?`, [{
        manager_id,
        is_closed: 1
    }, id]);

    res.json({ status: 'ok' });
})

module.exports = app;