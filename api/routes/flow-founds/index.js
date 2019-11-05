const express = require('express');
const app = express.Router();

const db = require('../../../libs/db');
const {

} = require('../../../models');

app.post('/getTable', async (req, res, next) => {


    const { timeMin, timeMax, cashStorageId } = req.body;

    const incomes = await db.execQuery(`SELECT * FROM incomes WHERE cash_storage_id = ?`, [cashStorageId]);
    const costs = await db.execQuery(`SELECT * FROM costs WHERE cash_storage_id = ?`, [cashStorageId]);

    res.render('partials/flow-founds-table', {
        layout: false,
    }, (error, html) => {
        
        if (error)
            return res.json({ status: 'bad', body: error.message });

        res.json({
            status: 'ok',
            body: html,
        });
    });
})

module.exports = app;