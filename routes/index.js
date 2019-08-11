const express = require('express');
const router = express.Router();

router.use('/cars', require('./cars'));
router.use('/customers', require('./customers'));
router.use('/clients', require('./clients'));
router.use('/drivers', require('./drivers'));
router.use('/itineraries', require('./itineraries'));
router.use('/cash-storages', require('./cash-storages'));
router.use('/additional-services', require('./additional-services'));
router.use('/apartments', require('./apartments'));
router.use('/apartment-reservations', require('./apartment-reservations'));
router.use('/price-list', require('./price-list'));
router.use('/car-reservation', require('./car-reservation'));
router.use('/incomes', require('./incomes'));
router.use('/costs', require('./costs'));
router.use('/costs-categories', require('./costs-categories'));
router.use('/list-used-cars', require('./list-used-cars'));
router.use('/detailing-cars', require('./detailing-cars'));
router.use('/detailing-apartments', require('./detailing-apartments'));
router.use('/invoices', require('./invoices'));

router.use('/salary-statement', require('./salary-statement'));
router.use('/act-sverki', require('./act-sverki'));

router.use('/cabinet', require('./cabinet'));
router.use('/balance', require('./balance'));
router.use('/suppliers', require('./suppliers'));

module.exports = router;