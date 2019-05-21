// Require library
const excel = require('excel4node');
const path = require('path');
const Helpers = require('./Helpers');

module.exports = ({
    number = '',
    period = '',
    customer = {},
    date = '',
    dataArray = [],
} = {}) => {

    return new Promise((resolve, reject) => {

        if (!date)
            throw new Error('Отсутствует date');

        if (!customer.id)
            throw new Error('Отсутствует заказчик');

        // Create a new instance of a Workbook class
        var wb = new excel.Workbook({
            defaultFont: {
                size: 11,
            },
        });

        // Add Worksheets to the workbook
        var ws = wb.addWorksheet('Sheet 1');

        ws.column(1).setWidth(14);
        ws.column(2).setWidth(24);
        ws.column(3).setWidth(14);
        ws.column(4).setWidth(20);
        ws.column(5).setWidth(8);
        ws.column(6).setWidth(23);

        ws.cell(1, 1, 2, 4, true).string('ОАО "Челябинвестбанк", г. Челябинск');

        ws.cell(1, 5).string('БИК');
        ws.cell(1, 6).string('47501779');

        ws.cell(2, 5).string('Сч. №');
        ws.cell(2, 6).string('30101810400000000779');

        ws.cell(3, 1, 3, 4, true).string('Банк получателя');

        ws.cell(4, 1).string('ИНН');
        ws.cell(4, 2).string('744511972706');
        ws.cell(4, 3).string('КПП');

        ws.cell(4, 5).string('Сч. №');
        ws.cell(4, 6).string('40802810390200001951');

        ws.cell(5, 1, 5, 4, true).string('Индивидуальный предприниматель Орехова Мария Юрьевна');
        ws.cell(6, 1, 6, 4, true).string('Получатель');

        ws.cell(8, 1, 8, 6, true).string(`Счёт на оплату № ${number} от ${date}`);

        ws.cell(9, 1).string(`Поставщик:`);
        ws.cell(9, 2, 9, 6, true).string(`Индивидуальный предприниматель Орехова Мария Юрьевна`);

        ws.cell(10, 1).string(`Покупатель:`);
        ws.cell(10, 2, 10, 6, true).string(customer.name);

        let currentRow = 13;

        ws.cell(currentRow, 1).string(`№`);
        ws.cell(currentRow, 2).string(`Товары (работы, услуги)`);
        ws.cell(currentRow, 3).string(`Кол-во`);
        ws.cell(currentRow, 4).string(`Ед.`);
        ws.cell(currentRow, 5).string(`Цена`);
        ws.cell(currentRow, 6).string(`Сумма`);

        let totalSum = 0;

        dataArray.forEach(values => {

            const sum = values[2] * values[4];

            ws.cell(currentRow, 1).string(values[0]);
            ws.cell(currentRow, 2).string(values[1]);
            ws.cell(currentRow, 3).string(values[2]);
            ws.cell(currentRow, 4).string(values[3]);
            ws.cell(currentRow, 5).string(values[4]);
            ws.cell(currentRow, 6).string(String(sum));

            totalSum += sum;

            currentRow++;
        })

        currentRow++;

        ws.cell(currentRow, 1, currentRow, 6, true);

        currentRow++;

        ws.cell(currentRow, 1, currentRow, 5, true).string(`Итого к оплате:`);
        ws.cell(currentRow, 6).number(totalSum);

        currentRow++;

        ws.cell(currentRow, 1, currentRow, 5, true).string(`В том числе НДС:`);
        ws.cell(currentRow, 6).string('Без НДС');

        currentRow++;

        ws.cell(currentRow, 1).string('Всего к оплате:');
        ws.cell(currentRow, 2, currentRow, 6, true).string(Helpers.sumToStr(totalSum));

        currentRow++;
        currentRow++;
        currentRow++;
        currentRow++;
        currentRow++;
        currentRow++;
        currentRow++;

        ws.cell(currentRow, 1).string('Поставщик');
        ws.cell(currentRow, 2).string('Индивидуальный предприниматель');
        ws.cell(currentRow, 5, currentRow, 6, true).string('Орехова Мария Юрьевна');

        currentRow++;

        ws.cell(currentRow, 2).string('должность');
        ws.cell(currentRow, 3).string('подпись');
        ws.cell(currentRow, 5, currentRow, 6, true).string('расшифровка подписи');


        const fileName = `invoice.${new Date().getTime()}.xlsx`;

        wb.write(path.join(__dirname, '..', 'uploads', fileName), (error, stats) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            resolve(fileName);
        });
    })
};