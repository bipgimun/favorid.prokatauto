const getAnalytics = require('../../libs/analytics/get-reports');

module.exports = async (req, res, next) => {

    const result = await getAnalytics({});

    const groupCosts = {};
    const groupServices = {};

    Object.values(result)
        .map(item => item.costsByCategory)
        .forEach(item => {
            Object.keys(item)
                .forEach(key => {
                    const value = item[key];
                    groupCosts[key] = groupCosts[key] || 0;
                    groupCosts[key] += +value;
                })
        });

    Object.values(result)
        .map(item => item.servicesGrouped)
        .forEach(item => {
            Object.keys(item)
                .forEach(key => {
                    const value = item[key];
                    groupServices[key] = groupServices[key] || 0;
                    groupServices[key] += +value;
                })
        });

    res.render(__dirname + '/analytics', {
        result,
        groupCosts,
        groupServices,
    });
}