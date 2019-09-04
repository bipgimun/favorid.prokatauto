const request = require('../request');
const qs = require('querystring');

module.exports = new class {

    constructor() {
        this.url = 'https://sms.ru/sms/send';
        this.api_id = '9ABE36FA-E96D-B8D9-85B8-BEA65CF0BBCD';
    }

    async send(phone, text, data) {

        if(!this.api_id) {
            throw new Error('Отсутствует app_id');
        }

        const query = qs.stringify({
            api_id: this.api_id,
            to: phone,
            msg: text,
            json: 1,
            ...data
        });

        const body = await request.get(`${this.url}?${query}`);

        return body;
    }
}