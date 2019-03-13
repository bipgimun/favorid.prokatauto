const getRemnants = require('../../libs/goods/getRemnants');

module.exports = async (req, res, next) => {
    const remnantsGroup = await getRemnants();
    return res.render(__dirname + '/remnants-of-goods', { resData: remnantsGroup });
};