const express = require('express');
const app = express.Router();

const moment = require('moment');

const printProjectsTable = require('../../../Service/printProjectsProfitTable');

const db = require('../../../libs/db');

app.post('/getTable', async (req, res, next) => {

    const { time_min, time_max, project } = req.body;

    const {
        moneyCosts,
        moneyIncomes,
        totalSum: sumAtEndPeriod,
    } = await calcData({ time_min, time_max, project });

    const { totalSum: balanceAtStartPeriod } = await calcData({
        project,
        time_max: moment(time_min).subtract(1, 'd').set({ h: 23, m: 59 }).format('YYYY-MM-DD')
    });

    const { totalSum: balanceAtNow } = await calcData({
        project,
        time_max: moment().add(1, 'd').set({ h: 23, m: 59 }).format('YYYY-MM-DD')
    });

    const balanceAtEndPeriod = balanceAtStartPeriod + sumAtEndPeriod;

    const operations = [...moneyCosts, ...moneyIncomes].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    res.render('partials/projects-profitability-table', {
        layout: false,
        operations,
        balanceAtNow,
        balanceAtStartPeriod,
        balanceAtEndPeriod,
    }, (error, html) => {

        if (error)
            return res.json({ status: 'bad', body: error.message });

        res.json({
            status: 'ok',
            html
        });
    });
})

app.get('/print', async (req, res, next) => {
    const { time_min, time_max, project } = req.query;

    if (!['carRents', 'apartmentRents', 'contracts'].includes(project)) {
        throw new Error('Неверный тип проекта');
    }

    const {
        moneyCosts,
        moneyIncomes,
        totalSum: sumAtEndPeriod,
    } = await calcData({ time_min, time_max, project });

    const { totalSum: balanceAtStartPeriod } = await calcData({
        project,
        time_max: moment(time_min).subtract(1, 'd').set({ h: 23, m: 59 }).format('YYYY-MM-DD')
    });

    const { totalSum: balanceAtNow } = await calcData({
        project,
        time_max: moment().add(1, 'd').set({ h: 23, m: 59 }).format('YYYY-MM-DD')
    });

    const balanceAtEndPeriod = balanceAtStartPeriod + sumAtEndPeriod;

    const operations = [...moneyCosts, ...moneyIncomes].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    const filepath = await printProjectsTable({
        operations,
        timeMax: moment(time_max).format('DD.MM.YYYY'),
        timeMin: moment(time_min).format('DD.MM.YYYY'),
        balanceAtEndPeriod,
        balanceAtStartPeriod,
        balanceAtNow,
        unitName: project,
    });

    res.download(filepath);
})


async function calcData({ time_min, time_max, project }) {

    if (!['carRents', 'apartmentRents', 'contracts'].includes(project)) {
        throw new Error('Неверный тип объекта');
    }

    const {
        moneyCosts,
        moneyIncomes
    } = await getCalcData({ project, time_max, time_min });

    const costSum = moneyCosts.map(cost => +cost.sum)
        .reduce((acc, sum) => +acc + +sum, 0);

    const incomeSum = moneyIncomes.map(cost => +cost.sum)
        .reduce((acc, sum) => +acc + +sum, 0);

    const totalSum = incomeSum - costSum;

    return { moneyCosts, moneyIncomes, totalSum };
}

const getCalcData = async ({ project, time_max = '', time_min = '' }) => {

    const dateGt = time_min
        ? moment(time_min).set({ h: 0, m: 0 }).format('YYYY-MM-DD')
        : '';

    const dateLt = time_max
        ? moment(time_max).set({ h: 23, m: 59 }).format('YYYY-MM-DD')
        : '';

    const moneyIncomes = [];
    const moneyCosts = [];

    const calcByUnit = {

        'carRents': async function calcByCar() {

            // разбивки по аренде
            const costBySplit = await db.execQuery(`
                SELECT c.*,
                    cd.price as sum
                FROM costs c
                    LEFT JOIN costs_details cd ON cd.cost_id = c.id
                WHERE cd.target_type = 'carsReserv'
                    ${time_max && time_min ? `AND DATE(c.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(c.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(c.date) <= '${dateLt}'` : ''}
            `);

            // расходы по основанию аренды
            const costsByRentBase = await db.execQuery(`
                SELECT *
                FROM costs
                WHERE code = 'CRR'
                    ${time_max && time_min ? `AND DATE(date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(date) <= '${dateLt}'` : ''}
            `);

            // 1) выбор приходников, у которых основание - аренда авто
            const incomesByRentBase = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.code = 'CRR'
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
                `
            );


            // 2) Выбор приходов по выставленному счету за аренду выбранного авто

            /**
             * выбор счетов, основание которых аренда выбранного авто
             * нужны чтобы выбрать приходники по этим счетам
             */
            const invoicesByRent = await db.execQuery(`
                SELECT *
                FROM invoices
                WHERE code = 'CRR'
            `);

            const invoicesId = invoicesByRent.map(item => item.id).join(',');

            // выбор приходов по счетам по аренде авто
            const incomesByInvoiceRent = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.code = 'pd'
                    AND i.document_id in (?)
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
                `, [invoicesId]
            );

            // --------------END--------------------

            // 3) Выбор приходников по счетам по детализацииям:

            /**
             * получение детализаций аренд
             */
            const detailingsByRent = await db.execQuery(`
                SELECT *
                FROM detailing_cars_details
            `);

            const detailingsIds = detailingsByRent.map(item => item.detailing_id).join(',');

            /**
             * Запрашиваем счета по выбранным детализациям
             */
            const invoicesByDetails = await db.execQuery(`
                SELECT *
                FROM invoices
                WHERE code = 'DET-A'
                    AND base_id IN (?)
            `, [detailingsIds]);

            const invoicesByDetailsIds = invoicesByDetails.map(item => item.id).join(',');

            /**
             * получили приходы, у которых основание - счёт по детализации, внутри которой есть аренда по выбранному авто
             * но тут сумма прихода - по всей детализации, а должна быть только по тем заявкам, в которых присутствует выбранное авто
             */
            const incomesByInvoiceDetailing = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.code = 'pd'
                    AND i.document_id in (?)
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
                `, [invoicesByDetailsIds]
            );

            // ----------------END-----------------

            for (const income of [...incomesByInvoiceDetailing, ...incomesByInvoiceRent, ...incomesByRentBase]) {
                const { sum, date, id } = income;
                let from = 'Неизвестно';

                if (income.customer_id) {
                    const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [income.customer_id]);

                    if (!customer) {
                        continue;
                    }

                    from = customer.name;
                } else if (income.supplier_id) {
                    const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [income.supplier_id]);

                    if (!supplier) {
                        continue;
                    }

                    from = supplier.name;
                } else if (income.driver_id) {
                    const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [income.driver_id]);

                    if (!driver) {
                        continue;
                    }

                    from = driver.name;
                }


                moneyIncomes.push({ date, from, sum, id, income: 1 });
            }

            for (const cost of [...costBySplit, ...costsByRentBase]) {

                const { sum, date, id } = cost;
                let from = '';

                if (cost.customer_id) {
                    const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [cost.customer_id]);

                    if (!customer) {
                        continue;
                    }

                    from = customer.name;
                } else if (cost.supplier_id) {
                    const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [cost.supplier_id]);

                    if (!supplier) {
                        continue;
                    }

                    from = supplier.name;
                } else if (cost.driver_id) {
                    const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [cost.driver_id]);

                    if (!driver) {
                        continue;
                    }

                    from = driver.name;
                }

                moneyCosts.push({ date, from, sum, id });
            }

            return { moneyCosts, moneyIncomes };
        },

        'apartmentRents': async () => {

            // разбивки по квартире
            const costsByApartmentsSpliting = await db.execQuery(`
                SELECT c.*,
                    cd.price as sum
                FROM costs c
                    LEFT JOIN costs_details cd ON cd.cost_id = c.id
                WHERE cd.target_type = ?
                    ${time_max && time_min ? `AND DATE(c.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(c.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(c.date) <= '${dateLt}'` : ''}
                `, ['apartments']
            );

            const costsByApartmentsRent = await db.execQuery(`
                SELECT *
                FROM costs
                WHERE code = 'APR'
                    ${time_max && time_min ? `AND DATE(date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(date) <= '${dateLt}'` : ''}
            `);

            // 1) выбор приходников, у которых основание - аренда хата
            const incomesByReserv = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.code = 'APR'
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
            `);


            // 2) Выбор приходов по выставленному счету за аренду выбранной хаты

            /**
             * выбор счетов, основание которых аренда выбранного авто
             * нужны чтобы выбрать приходники по этим счетам
             */
            const invoicesByRent = await db.execQuery(`
                SELECT *
                FROM invoices
                WHERE code = 'APR'
            `);

            const invoicesId = invoicesByRent.map(item => item.id).join(',');

            // выбор приходов по счетам по аренде авто
            const incomesByInvoiceRent = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.code = 'pd'
                    AND i.document_id in (?)
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
                `, [invoicesId]
            );

            // --------------END--------------------

            // 3) Выбор приходников по счетам по детализацииям:

            /**
             * Запрашиваем счета по выбранным детализациям
             */
            const invoicesByDetails = await db.execQuery(`
                SELECT *
                FROM invoices
                WHERE code = 'DET-K'
            `);

            const invoicesByDetailsIds = invoicesByDetails.map(item => item.id).join(',');

            /**
             * получили приходы, у которых основание - счёт по детализации, внутри которой есть аренда по выбранному авто
             * но тут сумма прихода - по всей детализации, а должна быть только по тем заявкам, в которых присутствует выбранное авто
             */
            const incomesByInvoiceDetailing = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.code = 'pd'
                    AND i.document_id in (?)
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
                `, [invoicesByDetailsIds]
            );

            // ----------------END-----------------

            for (const income of [...incomesByInvoiceDetailing, ...incomesByInvoiceRent, ...incomesByReserv]) {
                const { sum, date, id } = income;
                let from = 'Неизвестно';

                if (income.customer_id) {
                    const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [income.customer_id]);

                    if (!customer) {
                        continue;
                    }

                    from = customer.name;
                } else if (income.supplier_id) {
                    const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [income.supplier_id]);

                    if (!supplier) {
                        continue;
                    }

                    from = supplier.name;
                } else if (income.driver_id) {
                    const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [income.driver_id]);

                    if (!driver) {
                        continue;
                    }

                    from = driver.name;
                }


                moneyIncomes.push({ date, from, sum, id, income: 1 });
            }

            for (const cost of [...costsByApartmentsSpliting, ...costsByApartmentsRent]) {

                const { sum, date, id } = cost;
                let from = '';

                if (cost.customer_id) {
                    const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [cost.customer_id]);

                    if (!customer) {
                        continue;
                    }

                    from = customer.name;
                } else if (cost.supplier_id) {
                    const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [cost.supplier_id]);

                    if (!supplier) {
                        continue;
                    }

                    from = supplier.name;
                } else if (cost.driver_id) {
                    const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [cost.driver_id]);

                    if (!driver) {
                        continue;
                    }

                    from = driver.name;
                }

                moneyCosts.push({ date, from, sum, id });
            }

        },

        'contracts': async () => {

            // разбивки по контракту
            const costsByContractSpliting = await db.execQuery(`
                SELECT c.*,
                    cd.price as sum
                FROM costs c
                    LEFT JOIN costs_details cd ON cd.cost_id = c.id
                WHERE cd.target_type = 'contracts'
                    ${time_max && time_min ? `AND DATE(c.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(c.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(c.date) <= '${dateLt}'` : ''}
            `);

            // расходы по основанию - контракт
            const costsByContractBase = await db.execQuery(`
                SELECT *
                FROM costs
                WHERE code = 'MUZ'
                    ${time_max && time_min ? `AND DATE(date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(date) <= '${dateLt}'` : ''}
            `);


            // 1) выбор приходников, у которых основание - контракт
            const incomesByContractBase = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE LOWER(i.code) = 'MUZ'
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
            `);

            for (const income of [...incomesByContractBase]) {
                const { sum, date, id } = income;
                let from = 'Неизвестно';

                if (income.customer_id) {
                    const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [income.customer_id]);

                    if (!customer) {
                        continue;
                    }

                    from = customer.name;
                } else if (income.supplier_id) {
                    const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [income.supplier_id]);

                    if (!supplier) {
                        continue;
                    }

                    from = supplier.name;
                } else if (income.driver_id) {
                    const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [income.driver_id]);

                    if (!driver) {
                        continue;
                    }

                    from = driver.name;
                }


                moneyIncomes.push({ date, from, sum, id, income: 1 });
            }

            for (const cost of [...costsByContractSpliting, ...costsByContractBase]) {

                const { sum, date, id } = cost;
                let from = 'Неизвестно';

                if (cost.customer_id) {
                    const [customer] = await db.execQuery(`SELECT * FROM customers WHERE id = ?`, [cost.customer_id]);

                    if (!customer) {
                        continue;
                    }

                    from = customer.name;
                } else if (cost.supplier_id) {
                    const [supplier] = await db.execQuery(`SELECT * FROM suppliers WHERE id = ?`, [cost.supplier_id]);

                    if (!supplier) {
                        continue;
                    }

                    from = supplier.name;
                } else if (cost.driver_id) {
                    const [driver] = await db.execQuery(`SELECT * FROM drivers WHERE id = ?`, [cost.driver_id]);

                    if (!driver) {
                        continue;
                    }

                    from = driver.name;
                }

                moneyCosts.push({ date, from, sum, id });
            }
        },
    };

    await calcByUnit[project]();

    return {
        moneyIncomes,
        moneyCosts,
    };
}


module.exports = app;