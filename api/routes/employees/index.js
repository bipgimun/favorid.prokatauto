const router = require('express').Router();

const Joi = require('joi');

const db = require('../../../libs/db');
const md5 = require('md5');

const addSchema = Joi.object({
    login: Joi.string().regex(/[a-zA-Z]/).required(),
    password: Joi.string().required(),
    post: Joi.number().required(),
    last_name: Joi.string().required(),
    first_name: Joi.string().required(),
    middle_name: Joi.string().required(),
    birthday: Joi.date().required(),
    phone: Joi.string().required()
});

const updateSchema = Joi.object({
    login: Joi.string().regex(/[a-zA-Z]/),
    password: Joi.string().allow(''),
    postNumber: Joi.number(),
    last_name: Joi.string(),
    first_name: Joi.string(),
    middle_name: Joi.string(),
    birthday: Joi.date(),
    phone: Joi.string().allow(''),
    id: Joi.number().required()
});

router.post('/update', async (req, res, next) => {

    if (!req.session.user.is_director) {
        throw new Error('Нет доступа');
    }

    const { id, postNumber, login, password, ...values } = await updateSchema.validate(req.body);

    const data = {
        ...values,
        is_director: 0,
        is_manager: 0,
        is_senior_manager: 0,
    };

    let post = '';

    if (postNumber == '2') {
        data.is_manager = '1';
        post = 'Менеджер';
    } else if (postNumber == '1') {
        data.is_senior_manager = '1';
        post = 'Старший менеджер';
    } else {
        data.is_director = '0';
        post = 'Руководитель';
    }

    const query = {
        login
    };

    if (password) {
        query.password = md5(password);
    }

    await db.execQuery(`UPDATE employees SET ? WHERE id = ?`, [data, id]);
    await db.execQuery(`UPDATE managers SET ? WHERE employee_id = ?`, [query, id]);


    res.json({ status: 'ok', data, values });
});

router.post('/updateTarget', async (req, res, next) => {
    const { id, ...values } = req.body;

    if (Object.keys(values).length < 1) {
        throw new Error('Ошибка данных');
    }

    await db.execQuery(`UPDATE employees SET ? WHERE id = ?`, [values, id]);
    res.json({ status: 'ok' });
})

router.post('/add', async (req, res, next) => {
    const { login, password, post, ...values } = await addSchema.validate(req.body);

    const postValue = {
        is_director: post == '0',
        is_senior_manager: post == '1',
        is_manager: post == '2'
    };

    const employee_id = await db.insertQuery(`INSERT INTO employees SET ?`, { ...values, ...postValue });
    await db.insertQuery(`INSERT INTO managers SET ?`, { login, password: md5(password), employee_id });

    res.json({ status: 'ok' });
});

module.exports = router;