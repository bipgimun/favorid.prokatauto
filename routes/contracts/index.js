const router = require('express').Router();
const db = require('../../libs/db');

const {
    drivers: driverModel,
    muzContractsModel
} = require('../../models');

router.get('/', async (req, res, next) => {
    const drivers = await driverModel.get();
    const contracts = await muzContractsModel.get({});
    return res.render(__dirname + '/contracts-list', {
        drivers,
        contracts,
    })
})

router.get('/:id', async (req, res, next) => {
    if(!Number.isInteger(+req.params.id)) {
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

    drivers2contracts.forEach(item => {
        item.type_name = types[item.type];
    });

    return res.render(__dirname + '/contract-view', {
        contract,
        drivers2contracts,
        drivers,
        shifts
    })
})

module.exports = router;