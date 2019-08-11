const request = require('request');

module.exports = new class {
    get(url) {
        return new Promise((resolve, reject) => {
            request.get(url, {}, (err, response, body) => {


                if (err) {
                    console.error(err);
                    return reject(err);
                }

                return resolve(JSON.parse(body));
            });
        })
    }

    post(url) {
        return new Promise((resolve, reject) => {
            request.get(url, {}, (err, response, body) => {
                
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                return resolve(JSON.parse(body));
            });
        })
    }
}