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
        is_director: req.session.user.is_director,
        is_senior_manager: req.session.user.is_senior_manager,
        is_manager: req.session.user.is_manager,
        can_edit: req.session.user.is_director == '1' || req.session.user.is_senior_manager == '1',
        getType: (type) => {
            return types[type];
        }
    });
});

const printPL = require('../../libs/print-putevoy-list');

router.get('/print-list/:id', async (req, res, next) => {
    
    const [driver2shift] = await db.execQuery(`
        SELECT * 
        FROM drivers2shifts
        WHERE id = ${req.params.id}
    `);

    if(!driver2shift) {
        throw new Error('Запись поездки не найдена');
    }

    const [shift] = await db.execQuery(`SELECT * FROM shifts2contracts WHERE id = ${driver2shift.shift_id}`);

    if(!shift) {
        throw new Error('Смена не найдена');
    }

    const [contract] = await db.execQuery(`SELECT * FROM muz_contracts WHERE id = ${shift.contract_id}`);
    
    if(!contract) {
        throw new Error('Контракт не найден');
    }

    const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ${contract.customer_id}`);

    if(!customer) {
        throw new Error('Заказчик не найден');
    }

    const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ${driver2shift.driver_id}`);

    const filename = await printPL({
        id: req.params.id,
        driver,
        customer,
        shift
    });
    
    res.download(filename, 'PL-' + req.params.id + '.xlsx');
})

module.exports = router;