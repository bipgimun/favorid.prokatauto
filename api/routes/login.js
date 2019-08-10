const md5 = require('md5');
const db = require('../../libs/db');

module.exports = async (req, res, next) => {
    try {
        const { username: login, password } = req.body;

        if (!login)
            return res.send('Не указано имя пользователя');

        if (!password)
            return res.send('Не указан пароль');

        const passwordMD5 = md5(password);
        const [manager = {}] = await db.execQuery(`
            SELECT m.*,
                e.first_name,
                e.last_name,
                e.middle_name,
                e.is_director,
                e.is_senior_manager,
                e.is_manager,
                e.birthday,
                e.phone
            FROM managers m
                LEFT JOIN employees e ON m.employee_id = e.id
            WHERE login = ? 
                AND password = ?`
            , [login, passwordMD5]);

        if (!manager.id)
            return res.send('Учётной записи не найдено');

        req.session.user = { ...manager };

        res.redirect('/');
    } catch (error) {
        next(error);
    }
}