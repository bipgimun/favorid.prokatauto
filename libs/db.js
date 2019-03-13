const fs = require('fs');
const mysql = require('mysql2/promise');
const { db: dbConfig } = require('../config');

module.exports = new class Db {
    constructor() {
        this.connection = null;
        this.reconnectCounts = 0;
        this.MAX_RECONNECTS = 0;
        this.RECONNECT_TIME = 2000;
    }

    async connect() {

        try {
            this.connection = await mysql.createConnection(dbConfig);
        } catch (error) {
            return await this.reconnect(error);
        }

        this.connection.on('error', async error => {
            await this.reconnect(error)
        });

        console.log('Подключение к базе данных успешно');
    }

    reconnect(error) {
        return new Promise((resolve, reject) => {

            if (this.reconnectCounts > this.MAX_RECONNECTS) {
                console.error('Превышено максимальное количество попыток переподключиться к базе данных');
                process.exit(1);
            }

            this.reconnectCounts++;

            fs.appendFileSync('db.errors.log', `[${new Date().toLocaleString()}]: ${error.stack}\n`);

            if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                console.error('Соединение с базой данных пропало. Попытка переподключиться');
            } else if (error.code === 'ECONNREFUSED') {
                console.error('Не удалось подключиться к базе данных');
            } else {
                console.error('Ошибка при коннекте к базе данных: ', error);
            }

            setTimeout(() => (this.reconnectCounts = 0, resolve(this.connect())), this.RECONNECT_TIME);
        })
    }

    /**
     * 
     * @param {String} query строка запроса
     * @param {Object | Array} [data] данные для подстановки в запрос
     */
    async execQuery(query = '', data) {
        const [rows, fields] = await this.connection.query(query, data);
        return rows;
    }
    /**
     * @param {String} query строка запроса
     * @param {Object | Array} [data] данные для подстановки в запрос
     */
    async insertQuery(query = '', data) {
        const [rows, fields] = await this.connection.query(query, data);
        return rows.insertId;
    }
}