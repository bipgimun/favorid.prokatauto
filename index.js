const db = require('./libs/db');

db.connect().then(async () => {
    require('./app');
}).catch(error => {
    console.error(error);
    process.exit(1);
})