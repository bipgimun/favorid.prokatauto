const calcCashbox = require('../../libs/cashbox/calc');

module.exports = async (req, res, next) => {
    const result = await calcCashbox({});
    return res.render(__dirname + '/cashbox', { ...result });
};