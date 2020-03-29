const router = require('express').Router();
const db = require('../../libs/db');

const {
    drivers: driverModel,
    muzContractsModel
} = require('../../models');

router.get('/', async (req, res, next) => {
    const drivers = await driverModel.get();
    
    const contracts = await muzContractsModel.get({
        is_completed: '0'
    });

    return res.render(__dirname + '/contracts-list', {
        drivers,
        contracts,
    })
})

router.get('/archive', async (req, res, next) => {
    const drivers = await driverModel.get();
    
    const contracts = await muzContractsModel.get({
        is_completed: '1'
    });

    return res.render(__dirname + '/contracts-list', {
        drivers,
        contracts,
        is_archive: 1
    })
})

router.get('/:id', async (req, res, next) => {
    if (!Number.isInteger(+req.params.id)) {
        throw new Error('Неверный id');
    }


    const [contract] = await muzContractsModel.get({ id: req.params.id });
    const drivers = await driverModel.get();


    const drivers2contracts = await db.execQuery(`
        SELECT d2c.*,
            d.name as driver_name
        FROM drivers2contracts d2c
            LEFT JOIN drivers d ON d2c.driver_id = d.id
        WHERE d2c.muz_contract_id = ${req.params.id}
    `);

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

    const shifts = await db.execQuery(`
        SELECT s2c.*,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM shifts2contracts s2c
            LEFT JOIN employees e ON s2c.manager_id = e.id
        WHERE contract_id = ${req.params.id}
    `);

    const completedHoursByType = {
        'gorod': 0,
        'gorod_ostatki': 0,
        'komandirovki': 0,
        'gruzovie': 0,
        'pitanie': 0,
        'avtobus': 0,
        'vnedorozhnik': 0,
        'pomosh': 0,
        'other': 0,
    };

    for (const shift of shifts) {
        
        if(shift.is_completed != '1') {
            continue;
        }

        const drivers2shift = await db.execQuery(`SELECT * FROM drivers2shifts WHERE shift_id = ?`, [shift.id]);

        drivers2shift.forEach(driver2shift => {

            const { type, hours } = driver2shift;

            if (typeof completedHoursByType[type] == "undefined") {
                return;
            }

            completedHoursByType[type] += +hours;
        });
    }

    const totalCompletedHours = Object.values(completedHoursByType).reduce((acc, value) => acc + value, 0)

    const activeShifts = shifts.filter(shift => shift.is_completed != '1');

    const d = drivers2contracts.filter(item => +item.driver_id !== 0).map(item => {
        item.type_name = types[item.type];
        return item;
    });

    return res.render(__dirname + '/contract-view', {
        contract,
        drivers2contracts: d,
        drivers,
        can_edit: req.session.user.is_director == '1' || contract.is_completed == '0' && req.session.user.is_senior_manager == '1' ,
        totalCompletedHours,
        completedHours: completedHoursByType,
        shifts: activeShifts
    })
})

module.exports = router;