const router = require('express').Router();
const db = require('../../../libs/db');

const {
    muzContractsModel
} = require('../../../models');

router.post('/add', async (req, res, next) => {

    const { drivers, ...values } = req.body;
    const contractId = await muzContractsModel.add({ ...values, manager_id: req.session.user.employee_id });

    for (const driver of drivers) {
        await db.insertQuery(`INSERT INTO drivers2contracts SET ?`, [{ ...driver, muz_contract_id: contractId }]);
    }

    res.json({ status: 'ok', body: req.body });
})

router.post('/close', async (req, res, next) => {
    const { id } = req.body;
    await db.execQuery(`UPDATE muz_contracts SET ? WHERE id = ?`, [{
        is_completed: 1
    }, id]);

    res.json({ status: 'ok' });
})

const Joi = require('joi');

const updateSchema = Joi.object({
    id: Joi.number().required(),
    comment: Joi.string().empty('').default(null).required(),
    customer_id: Joi.number().required(),
    total_value: Joi.number().empty('').default(null).required(),
    cash_security: Joi.number().empty('').default(null).required(),
    total_hours: Joi.number().empty('').default(null).required(),
    gorod_hours: Joi.number().empty('').default(null),
    gorod_value: Joi.string().empty('').default(null),
    gorod_ostatki_hours: Joi.string().empty('').default(null),
    gorod_ostatki_value: Joi.string().empty('').default(null),
    komandirovki_hours: Joi.string().empty('').default(null),
    komandirovki_value: Joi.string().empty('').default(null),
    gruzovie_hours: Joi.string().empty('').default(null),
    gruzovie_value: Joi.string().empty('').default(null),
    pitanie_hours: Joi.string().empty('').default(null),
    pitanie_value: Joi.string().empty('').default(null),
    avtobus_hours: Joi.string().empty('').default(null),
    avtobus_value: Joi.string().empty('').default(null),
    vnedorozhnik_hours: Joi.string().empty('').default(null),
    vnedorozhnik_value: Joi.string().empty('').default(null),
    pomosh_hours: Joi.string().empty('').default(null),
    pomosh_value: Joi.string().empty('').default(null),
    other_hours: Joi.string().empty('').default(null),
    other_value: Joi.string().empty('').default(null),
    other_name: Joi.string().empty('').default(null),
})

router.post('/update', async (req, res, next) => {

    const {id, ...validValues} = await updateSchema.validate(req.body);
    await db.execQuery(`UPDATE muz_contracts SET ? WHERE id = ?`, [validValues, id]);
    
    res.json({ status: 'ok' });
})

module.exports = router;