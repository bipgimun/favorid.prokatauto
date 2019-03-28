const db = require('../../libs/db');

module.exports = async (req, res, next) => {

    const itineraries = await db.execQuery(`SELECT * FROM itineraries`);

    res.render(__dirname + '/itineraries-list', { itineraries });
}