const express = require('express');
const app = express.Router();

const moment = require('moment');

const printUnitsTable = require('../../../Service/printUnitsProfitTable');

const db = require('../../../libs/db');

app.post('/getTable', async (req, res, next) => {

    const { time_min, time_max, unit } = req.body;

    const {
        moneyCosts,
        moneyIncomes,
        totalSum: sumAtEndPeriod,
    } = await calcData({ time_min, time_max, unit });

    const { totalSum: balanceAtStartPeriod } = await calcData({
        unit,
        time_max: moment(time_min).subtract(1, 'd').set({ h: 23, m: 59 }).format('YYYY-MM-DD')
    });

    const { totalSum: balanceAtNow } = await calcData({
        unit,
        time_max: moment().add(1, 'd').set({ h: 23, m: 59 }).format('YYYY-MM-DD')
    });

    const balanceAtEndPeriod = balanceAtStartPeriod + sumAtEndPeriod;

    const operations = [...moneyCosts, ...moneyIncomes].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    res.render('partials/units-profitability-table', {
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
    const { time_min, time_max, unit } = req.query;

    const [, typeOfUnit, unitValue] = unit.match(/([\w\-]*)-(\d*)/);

    if (!['APR', 'CAR', 'MUZ'].includes(typeOfUnit)) {
        throw new Error('Неверный тип объекта');
    }

    const {
        moneyCosts,
        moneyIncomes,
        totalSum: sumAtEndPeriod,
    } = await calcData({ time_min, time_max, unit });

    const { totalSum: balanceAtStartPeriod } = await calcData({
        unit,
        time_max: moment(time_min).subtract(1, 'd').set({ h: 23, m: 59 }).format('YYYY-MM-DD')
    });

    const { totalSum: balanceAtNow } = await calcData({
        unit,
        time_max: moment().add(1, 'd').set({ h: 23, m: 59 }).format('YYYY-MM-DD')
    });

    const balanceAtEndPeriod = balanceAtStartPeriod + sumAtEndPeriod;

    const operations = [...moneyCosts, ...moneyIncomes].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    let unitTitle = '';

    if (typeOfUnit == 'APR') {
        const [apartment] = await db.execQuery(`SELECT * FROM apartments WHERE id = ?`, [unitValue]);

        if (apartment) {
            unitTitle = apartment.address;
        }

    } else if (typeOfUnit == 'CAR') {

        const [car] = await db.execQuery(`SELECT * FROM cars WHERE id = ?`, [unitValue]);

        if(car) {
            unitTitle = `${car.name} ${car.model} ${car.number}`;
        }

    } else if (typeOfUnit == 'MUZ') {
        unitTitle = 'MUZ-' + unitValue;
    }

    const filepath = await printUnitsTable({
        operations,
        timeMax: moment(time_max).format('DD.MM.YYYY'),
        timeMin: moment(time_min).format('DD.MM.YYYY'),
        balanceAtEndPeriod,
        balanceAtStartPeriod,
        balanceAtNow,
        unitName: typeOfUnit,
        unitTitle,
    });

    res.download(filepath);
})


async function calcData({ time_min, time_max, unit }) {

    const [, typeOfUnit, unitValue] = unit.match(/([\w\-]*)-(\d*)/);

    if (!['APR', 'CAR', 'CUST', 'MUZ'].includes(typeOfUnit)) {
        throw new Error('Неверный тип объекта');
    }

    const {
        moneyCosts,
        moneyIncomes
    } = await getCalcData({ unit: typeOfUnit, unitValue, time_max, time_min });

    const costSum = moneyCosts.map(cost => +cost.sum)
        .reduce((acc, sum) => +acc + +sum, 0);

    const incomeSum = moneyIncomes.map(cost => +cost.sum)
        .reduce((acc, sum) => +acc + +sum, 0);

    const totalSum = incomeSum - costSum;

    return { moneyCosts, moneyIncomes, totalSum };
}

const getCalcData = async ({ unit, unitValue, time_max = '', time_min = '' }) => {

    const dateGt = time_min
        ? moment(time_min).set({ h: 0, m: 0 }).format('YYYY-MM-DD')
        : '';

    const dateLt = time_max
        ? moment(time_max).set({ h: 23, m: 59 }).format('YYYY-MM-DD')
        : '';

    const moneyIncomes = [];
    const moneyCosts = [];

    const calcByUnit = {

        'CAR': async function calcByCar() {

            // разбивки по авто
            const costsByCar = await db.execQuery(`
                SELECT c.*,
                    cd.price as sum
                FROM costs c
                    LEFT JOIN costs_details cd ON cd.cost_id = c.id
                WHERE cd.target_type = ?
                    AND cd.target_id = ?
                    ${time_max && time_min ? `AND DATE(c.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(c.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(c.date) <= '${dateLt}'` : ''}
                `, ['auto', unitValue]
            );

            // заявки на аренду по выбранному авто
            const reservsByCar = await db.execQuery(`SELECT * FROM cars_reservations WHERE car_id = ?`, [unitValue]);

            // айди заявок, в которых присутствует авто
            const reservsIds = reservsByCar.map(item => item.id).join(',');

            // 1) выбор приходников, у которых основание - аренда авто
            const incomesByReserv = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.code = 'CRR'
                    AND i.document_id IN (?)
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
                `, [reservsIds]
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
                    AND base_id IN (?)
                `, [reservsIds]
            );

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
             * получение детализаций, у которых есть аренда выбранного авто
             */
            const detailingsByRent = await db.execQuery(`
                SELECT *
                FROM detailing_cars_details
                WHERE reserv_id IN (?)
            `, [reservsIds]);

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

            // установка суммы приходу, исходя из суммы сумм ареды выбранно авто в детализации
            for (const income of incomesByInvoiceDetailing) {

                // получаем заявку по приходу
                const [invoice] = await db.execQuery(`SELECT * FROM invoices WHERE id = ?`, [income.document_id]);

                // на всякий случай
                if (!invoice) {
                    continue;
                }

                // получаем детализации по выбранному счёту
                const detailingDetails = await db.execQuery('SELECT * FROM detailing_cars_details WHERE detailing_id = ?', [invoice.base_id]);

                /**
                 * 1) из детализации выбираем только те заявки, в которых присутствует выбранное авто
                 * 2) по полученным заявкам считаем их сумму
                 */
                const sum = detailingDetails
                    .filter(detailing => reservsByCar.find(rent => rent.id == detailing.reserv_id))
                    .map(detailing => reservsByCar.find(rent => rent.id == detailing.reserv_id))
                    .map(rent => +rent.sum)
                    .reduce((acc, sum) => +acc + +sum, 0);

                // устанавливаем сумму приходу
                income.sum = sum;
            }

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

            for (const cost of costsByCar) {

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

        'APR': async () => {

            // разбивки по квартире
            const costsByApartmentsSpliting = await db.execQuery(`
                SELECT c.*,
                    cd.price as sum
                FROM costs c
                    LEFT JOIN costs_details cd ON cd.cost_id = c.id
                WHERE cd.target_type = ?
                    AND cd.target_id = ?
                    ${time_max && time_min ? `AND DATE(c.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(c.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(c.date) <= '${dateLt}'` : ''}
                `, ['apartments', unitValue]
            );

            const costsByApartmentsRent = await db.execQuery(`
                SELECT *
                FROM costs
                WHERE code = 'APR'
                    AND document_id = ?
                    ${time_max && time_min ? `AND DATE(date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(date) <= '${dateLt}'` : ''}
            `, [unitValue]);

            // заявки на аренду по выбранной хате
            const rentByApartments = await db.execQuery(`SELECT * FROM apartment_reservations WHERE apartment_id = ?`, [unitValue]);

            // айди заявок, в которых присутствует хата
            const rentIds = rentByApartments.map(item => item.id).join(',');

            // 1) выбор приходников, у которых основание - аренда хата
            const incomesByReserv = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE i.code = 'APR'
                    AND i.document_id IN (?)
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
                `, [rentIds]
            );


            // 2) Выбор приходов по выставленному счету за аренду выбранной хаты

            /**
             * выбор счетов, основание которых аренда выбранного авто
             * нужны чтобы выбрать приходники по этим счетам
             */
            const invoicesByRent = await db.execQuery(`
                SELECT *
                FROM invoices
                WHERE code = 'APR'
                    AND base_id IN (?)
                `, [rentIds]
            );

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
             * получение детализаций, у которых есть аренда выбранного авто
             */
            const detailingsByRent = await db.execQuery(`
                SELECT *
                FROM detailing_apartments_details
                WHERE reserv_id IN (?)
            `, [rentIds]);

            const detailingsIds = detailingsByRent.map(item => item.detailing_id).join(',');

            /**
             * Запрашиваем счета по выбранным детализациям
             */
            const invoicesByDetails = await db.execQuery(`
                SELECT *
                FROM invoices
                WHERE code = 'DET-K'
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

            // установка суммы приходу, исходя из суммы сумм ареды выбранно авто в детализации
            for (const income of incomesByInvoiceDetailing) {

                // получаем заявку по приходу
                const [invoice] = await db.execQuery(`SELECT * FROM invoices WHERE id = ?`, [income.document_id]);

                // на всякий случай
                if (!invoice) {
                    continue;
                }

                // получаем детализации по выбранному счёту
                const detailingDetails = await db.execQuery('SELECT * FROM detailing_apartments_details WHERE detailing_id = ?', [invoice.base_id]);

                /**
                 * 1) из детализации выбираем только те заявки, в которых присутствует выбранное авто
                 * 2) по полученным заявкам считаем их сумму
                 */
                const sum = detailingDetails
                    .filter(detailing => rentByApartments.find(rent => rent.id == detailing.reserv_id))
                    .map(detailing => rentByApartments.find(rent => rent.id == detailing.reserv_id))
                    .map(rent => +rent.sum)
                    .reduce((acc, sum) => +acc + +sum, 0);

                // устанавливаем сумму приходу
                income.sum = sum;
            }

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

        'MUZ': async () => {

            // разбивки по контракту
            const costsByContractSpliting = await db.execQuery(`
                SELECT c.*,
                    cd.price as sum
                FROM costs c
                    LEFT JOIN costs_details cd ON cd.cost_id = c.id
                WHERE cd.target_type = ?
                    AND cd.target_id = ?
                    ${time_max && time_min ? `AND DATE(c.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(c.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(c.date) <= '${dateLt}'` : ''}
                `, ['contracts', unitValue]
            );

            // расходы по основанию - контракт
            const costsByContractBase = await db.execQuery(`
                SELECT *
                FROM costs
                WHERE code = 'MUZ'
                    AND document_id = ?
                    ${time_max && time_min ? `AND DATE(date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(date) <= '${dateLt}'` : ''}
            `, [unitValue]);

            // заявки на аренду по выбранной хате
            // const rentByApartments = await db.execQuery(`SELECT * FROM apartment_reservations WHERE apartment_id = ?`, [unitValue]);

            // айди заявок, в которых присутствует хата
            // const rentIds = rentByApartments.map(item => item.id).join(',');

            // 1) выбор приходников, у которых основание - контракт
            const incomesByContractBase = await db.execQuery(`
                SELECT i.*
                FROM incomes i
                WHERE LOWER(i.code) = 'MUZ'
                    AND i.document_id IN (?)
                    ${time_max && time_min ? `AND DATE(i.date) BETWEEN '${dateGt}' AND '${dateLt}'` : ''}
                    ${time_min && !time_max ? `AND DATE(i.date) >= '${dateGt}'` : ''}
                    ${!time_min && time_max ? `AND DATE(i.date) <= '${dateLt}'` : ''}
                `, [unitValue]
            );


            // 2) Выбор приходов по выставленному счету за аренду выбранной хаты

            /**
             * выбор счетов, основание которых аренда выбранного авто
             * нужны чтобы выбрать приходники по этим счетам
             */
            const invoicesByContract = await db.execQuery(`
                SELECT *
                FROM invoices
                WHERE code = 'MUZ'
                    AND base_id IN (?)
                `, [unitValue]
            );

            const invoicesId = invoicesByContract.map(item => item.id).join(',');

            // выбор приходов по счетам по аренде авто
            const incomesByInvoiceContract = await db.execQuery(`
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

            for (const income of [...incomesByInvoiceContract, ...incomesByContractBase]) {
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

    await calcByUnit[unit]();

    return {
        moneyIncomes,
        moneyCosts,
    };
}


module.exports = app;