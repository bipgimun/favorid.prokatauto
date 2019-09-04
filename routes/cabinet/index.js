const db = require('../../libs/db');

const express = require('express');
const router = express.Router();

const {
    employeesModel,
} = require('../../models');

router.get('/', async function (req, res, next) {

    const employees = (await employeesModel.get())
        .filter(item => item.is_fired != '1');

    for (const item of employees) {
        item.post = 'Менеджер';

        if (item.is_director) {
            item.post = 'Руководитель';
        } else if (item.is_senior_manager) {
            item.post = 'Старший менеджер';
        }
    }

    const managerInfo = { ...req.session.user, post: 'Менеджер' };

    if (req.session.user.is_director) {
        managerInfo.post = 'Руководитель';
    } else if (req.session.user.is_senior_manager) {
        managerInfo.post = 'Старший менеджер';
    }

    res.render(__dirname + '/cabinet', {
        employees,
        show_list: req.session.user.is_director == '1',
        managerInfo
    });
})

router.get('/fired', async function (req, res, next) {

    const employees = (await employeesModel.get())
        .filter(item => item.is_fired == '1');

    for (const item of employees) {
        item.post = 'Менеджер';

        if (item.is_director) {
            item.post = 'Руководитель';
        } else if (item.is_senior_manager) {
            item.post = 'Старший менеджер';
        }
    }

    const managerInfo = { ...req.session.user, post: 'Менеджер' };

    if (req.session.user.is_director) {
        managerInfo.post = 'Руководитель';
    } else if (req.session.user.is_senior_manager) {
        managerInfo.post = 'Старший менеджер';
    }

    res.render(__dirname + '/fireds', {
        employees,
        show_list: req.session.user.is_director == '1',
        managerInfo
    });
})

router.get('/:id', async function (req, res, next) {

    if (req.session.user.is_director != '1') {
        throw new Error('Недостаточно прав');
    }

    const [employee = {}] = await db.execQuery(`
            SELECT m.*,
                e.first_name,
                e.last_name,
                e.middle_name,
                e.is_director,
                e.is_senior_manager,
                e.is_manager,
                e.birthday,
                e.phone,
                e.is_fired
            FROM managers m
                LEFT JOIN employees e ON m.employee_id = e.id
            WHERE 
                employee_id = ? 
        `, [req.params.id]);

    employee.post = 'Менеджер';
    employee.postNumber = '2';

    if (employee.is_director) {
        employee.post = 'Руководитель';
        employee.postNumber = '0';
    } else if (employee.is_senior_manager) {
        employee.post = 'Старший менеджер';
        employee.postNumber = '1';
    }

    res.render(__dirname + '/manager-cabinet', {
        can_fired: req.session.user.is_director == '1',
        employee,
        id: req.params.id
    });
})

module.exports = router;