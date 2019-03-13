const db = require('../../../libs/db');

module.exports = async (req, res, next) => {
    try {
        const { datas } = req.body;
        const { employee_id: admin_id } = req.session.user;

        for (const body of datas) {
            const { master: master_id, service: service_id, price, percent_master, percent_admin, comment = '' } = body;

            if (!master_id)
                throw new Error('Не выбран мастер');

            if (!service_id)
                throw new Error('Не выбрана услуга');

            if (!price)
                throw new Error('Отсутствует цена');

            if (+price < 0)
                throw new Error('Цена меньше нуля');

            if (!percent_master)
                throw new Error('Отсутствует процент мастера');

            if (+percent_master < 0 || +percent_master > 100)
                throw new Error('Неверно задан процент мастера');

            if (!percent_admin)
                throw new Error('Отсутствует процент админа');

            if (+percent_admin < 0 || +percent_admin > 100)
                throw new Error('Неверно задан процент админа');

            if ((+percent_admin + +percent_master) > 100)
                throw new Error('Не верно заданы проценты');

            const adminSum = price * (percent_admin / 100);
            const masterSum = price * (percent_master / 100);

            await db.insertQuery(`INSERT INTO sales_services SET ?`, {
                master_id,
                service_id,
                admin_id,
                price,
                comment,
                percent_master: masterSum,
                percent_admin: adminSum,
                percent_master_count: percent_master,
                percent_admin_count: percent_admin,
            });

            return res.json({ status: 'ok' });
        }
    } catch (error) {
        return res.json({ status: 'bad', message: error.message });
    }
}