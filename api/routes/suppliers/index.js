const moment = require('moment');

const db = require('../../../libs/db');
const { wishList } = require('../../wish-list');

const messages = require('../../messages');

const router = require('express').Router();

router.post('/add', async (req, res, next) => {

    const values = req.body;

    const validValues = await wishList.customers.validate(values);

    const id = await db.insertQuery(`INSERT INTO suppliers SET ?`, validValues);

    validValues.id = id;
    validValues.is_legal_entity = validValues.is_legal_entity == '1' ? 'Юридическре лицо' : 'Физ. лицо'

    res.json({ status: 'ok', data: validValues });
})

router.post('/update', async (req, res, next) => {

    const { id, ...fields } = req.body;

    const validValues = await wishList.customers.validate(fields);

    if (!id)
        throw new Error(messages.missingId);

    if (Object.keys(validValues).length < 1)
        throw new Error(messages.missingUpdateValues);

    await db.execQuery(`UPDATE suppliers SET ? WHERE id = ?`, [validValues, id]);

    if (validValues.birthday)
        validValues.birthday = moment(validValues.birthday).format('DD.MM.YYYY');

    if (validValues.driver_license_issue_date)
        validValues.driver_license_issue_date = moment(validValues.driver_license_issue_date).format('DD.MM.YYYY');

    res.json({ status: 'ok', data: validValues });
})


router.post('/delete', async (req, res, next) => {

    const { id } = req.body;

    if (!id)
        throw new Error('id missing');

    await db.execQuery('DELETE FROM suppliers WHERE id = ?', [id]);

    res.json({ status: 'ok' });
})

router.get('/getSelect2', async (req, res, next) => {
    const suppliers = await db.execQuery(`SELECT * FROM suppliers`);
    res.json({ items: suppliers });
})

module.exports = router;