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
                size: 9,
                name: 'Arial',
            },
        });

        const MEDIUM = 'medium';
        const THIN = 'thin';

        // Add Worksheets to the workbook
        var ws = wb.addWorksheet('Sheet 1');

        ws.column(1).setWidth(14);
        ws.column(2).setWidth(41);
        ws.column(3).setWidth(14);
        ws.column(4).setWidth(20);
        ws.column(5).setWidth(8);
        ws.column(6).setWidth(23);

        ws.cell(1, 1, 2, 4, true).string('ОАО "Челябинвестбанк", г. Челябинск').style({
            alignment: {
                vertical: 'center',
            },
        });

        ws.cell(1, 5).string('БИК');
        ws.cell(1, 6).string('47501779').style({ font: { size: 11, name: 'Calibri' } });

        ws.cell(2, 5).string('Сч. №');
        ws.cell(2, 6).string('30101810400000000779').style({ font: { size: 11, name: 'Calibri' } });

        ws.cell(3, 1, 3, 4, true).string('Банк получателя').style({ font: { size: 8 } });

        ws.cell(4, 1).string('ИНН');
        ws.cell(4, 2).string('744511972706');
        ws.cell(4, 3).string('КПП');

        ws.cell(4, 5).string('Сч. №');
        ws.cell(4, 6).string('40802810390200001951').style({ font: { size: 11, name: 'Calibri' } });

        ws.cell(5, 1, 5, 4, true).string('Индивидуальный предприниматель Орехова Мария Юрьевна');
        ws.cell(6, 1, 6, 4, true).string('Получатель').style({ font: { size: 8 } });

        ws.cell(8, 1, 8, 6, true).string(`Счёт на оплату № ${number} от ${date}`).style({
            font: {
                bold: true,
                size: 14,
            },
            alignment: {
                horizontal: 'center'
            }
        });

        ws.cell(9, 1).string(`Поставщик:`);
        ws.cell(9, 2, 9, 6, true).string(`Индивидуальный предприниматель Орехова Мария Юрьевна`);

        ws.cell(10, 1).string(`Покупатель:`);
        ws.cell(10, 2, 10, 6, true).string(`${customer.name.toUpperCase()}, ИНН: ${customer.inn}, БИК: ${customer.bik}`);

        let currentRow = 13;

        const borderTopRightBottom = wb.createStyle({
            border: {
                top: { style: MEDIUM, color: 'black' },
                bottom: { style: MEDIUM, color: 'black' },
                right: { style: MEDIUM, color: 'black' }
            }
        });

        ws.cell(currentRow, 1).string(`№`).style(borderTopRightBottom);
        ws.cell(currentRow, 2).string(`Товары (работы, услуги)`).style(borderTopRightBottom);
        ws.cell(currentRow, 3).string(`Кол-во`).style(borderTopRightBottom);
        ws.cell(currentRow, 4).string(`Ед.`).style(borderTopRightBottom);
        ws.cell(currentRow, 5).string(`Цена`).style(borderTopRightBottom);
        ws.cell(currentRow, 6).string(`Сумма`).style(borderTopRightBottom);
        currentRow++;

        let totalSum = 0;

        dataArray.forEach(values => {

            const sum = values[2] * values[4];

            ws.cell(currentRow, 1).number(values[0]).style({ ...borderTopRightBottom, alignment: { horizontal: 'center' } });
            ws.cell(currentRow, 2).string(values[1]).style(borderTopRightBottom);
            ws.cell(currentRow, 3).number(values[2]).style(borderTopRightBottom);
            ws.cell(currentRow, 4).string(values[3]).style(borderTopRightBottom);
            ws.cell(currentRow, 5).number(values[4]).style(borderTopRightBottom);
            ws.cell(currentRow, 6).number(sum).style(borderTopRightBottom);

            totalSum += sum;

            currentRow++;
        })

        currentRow++;

        ws.cell(currentRow, 1, currentRow, 6, true);

        currentRow++;

        ws.cell(currentRow, 1, currentRow, 5, true).string(`Итого к оплате:`).style({ font: { bold: true }, alignment: { horizontal: 'right' } });
        ws.cell(currentRow, 6).number(totalSum).style({ font: { bold: true }, alignment: { horizontal: 'right' } });

        currentRow++;

        ws.cell(currentRow, 1, currentRow, 5, true).string(`В том числе НДС:`).style({ alignment: { horizontal: 'right' } });
        ws.cell(currentRow, 6).string('Без НДС').style({ alignment: { horizontal: 'right' } });

        currentRow++;

        ws.cell(currentRow, 1).string('Всего к оплате:');
        ws.cell(currentRow, 2, currentRow, 6, true).string(Helpers.sumToStr(totalSum)).style({ font: { name: 'Calibri' } });

        currentRow++;
        currentRow++;
        currentRow++;
        currentRow++;
        currentRow++;
        currentRow++;
        currentRow++;

        ws.cell(currentRow, 1).string('Поставщик');
        ws.cell(currentRow, 2).string('Индивидуальный предприниматель').style({ alignment: { wrapText: true, horizontal: 'center' } });
        ws.cell(currentRow, 2, currentRow, 3).style({ border: { bottom: { style: MEDIUM, color: 'black' } } });
        ws.cell(currentRow, 5, currentRow, 6, true).string('Орехова Мария Юрьевна').style({
            border: {
                bottom: {
                    style: MEDIUM,
                    color: 'black'
                },
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center'
            }
        });

        currentRow++;

        ws.cell(currentRow, 2).string('должность').style({ font: { size: 8 }, alignment: { horizontal: 'center', vertical: 'center' } });
        ws.cell(currentRow, 3).string('подпись').style({ font: { size: 8 }, alignment: { horizontal: 'center', vertical: 'center' } });
        ws.cell(currentRow, 5, currentRow, 6, true).string('расшифровка подписи').style({ font: { size: 8 }, alignment: { horizontal: 'center' } });

        ws.cell(3, 1, 3, 6).style({
            border: {
                bottom: {
                    style: MEDIUM,
                    color: 'black'
                },
            }
        });

        ws.cell(4, 1, 4, 4).style({
            border: {
                bottom: {
                    style: MEDIUM,
                    color: 'black'
                },
            }
        });

        ws.cell(6, 1, 6, 6).style({
            border: {
                bottom: {
                    style: MEDIUM,
                    color: 'black'
                },
            }
        });

        ws.cell(1, 5, 1, 6).style({
            border: {
                bottom: {
                    style: MEDIUM,
                    color: 'black'
                },
            }
        });

        ws.cell(1, 5, 6, 5).style({
            border: {
                left: {
                    style: MEDIUM,
                    color: 'black'
                },
                right: {
                    style: MEDIUM,
                    color: 'black'
                }
            }
        })

        ws.cell(1, 6, 6, 6).style({
            border: {
                left: {
                    style: MEDIUM,
                    color: 'black'
                },
                right: {
                    style: MEDIUM,
                    color: 'black'
                }
            }
        })

        ws.cell(4, 1, 4, 4).style({
            border: {
                right: {
                    style: MEDIUM,
                    color: 'black'
                }
            }
        })


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