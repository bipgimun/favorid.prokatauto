const router = require('express').Router();
const db = require('../../libs/db');

router.get('/:id', async (req, res, next) => {

    if(!Number.isInteger(+req.params.id)) {
        throw new Error('Неверный номер смены');
    }

    const [shift] = await db.execQuery(`
        SELECT s2c.*,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM shifts2contracts s2c
            LEFT JOIN employees e ON s2c.manager_id = e.id
        WHERE s2c.id = ${req.params.id}
    `);

    if (!shift) {
        throw new Error('Смена не найдена');
    }

      const types = {
        'gorod': 'Город',
        'gorod_ostatki': 'Город (остатки)',
        'komandirovki': 'Командировки',
        'gruzovie': 'Грузовые',
        'pitanie': 'Питание',
        'avtobus': 'Автобус',
        'vnedorozhnik': 'Внедорожник',
        'pomosh': 'Скорая помощь',
        'other': 'Свой тип',
    };

    const drivers2shifts = await db.execQuery(`
        SELECT d2s.*,
            d.name as driver_name
        FROM drivers2shifts d2s
            LEFT JOIN drivers d ON d.id = d2s.driver_id
        WHERE d2s.shift_id = ${req.params.id}
    `);

    drivers2shifts.forEach(item => {
        item.total_value = +item.hours * +item.value;
    });

    res.render(__dirname + '/shift.hbs', {
        shift,
        drivers2shifts,
        types,
        getType: (type) => {
            return types[type];
        }
    });
})

module.exports = router;