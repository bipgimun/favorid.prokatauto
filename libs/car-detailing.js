// Require library
var excel = require('excel4node');
const path = require('path');

module.exports = ({
    number = '',
    period = '',
    customer = {},
    dataArray = [],
} = {}) => {

    return new Promise((resolve, reject) => {
        if (!period)
            throw new Error('Отсутствует период для детализации');



        // Create a new instance of a Workbook class
        var wb = new excel.Workbook({
            defaultFont: {
                size: 11,
            },
        });

        // Add Worksheets to the workbook
        var ws = wb.addWorksheet('Sheet 1');

        const titleStyle = wb.createStyle({
            font: {
                size: 14,
                bold: true
            },
            alignment: {
                horizontal: 'center'
            }
        });

        const subtitleStyle = wb.createStyle({
            font: {
                size: 11,
            },
            alignment: {
                horizontal: 'center'
            }
        });

        ws.column(1).setWidth(14);
        ws.column(2).setWidth(14);
        ws.column(3).setWidth(46);
        ws.column(4).setWidth(40);
        ws.column(5).setWidth(21);
        ws.column(6).setWidth(9);

        ws.row(3).setHeight(25);

        ws.cell(1, 6, 2, 6).style(wb.createStyle({
            border: {
                right: {
                    style: 'thin',
                    color: 'black'
                },
            }
        }));

        ws.cell(2, 1, 2, 6).style(wb.createStyle({
            border: {
                right: {
                    style: 'thin',
                    color: 'black'
                },
                bottom: {
                    style: 'thin',
                    color: 'black'
                },
            }
        }))

        // Set value of cell A1 to 100 as a number type styled with paramaters of style
        ws.cell(1, 1, 1, 6, true).string(`Детализация поездок № ${number}`).style(titleStyle);
        ws.cell(2, 1, 2, 6, true).string(`за ${period}`).style(subtitleStyle);

        ws.cell(3, 1).string('Дата');
        ws.cell(3, 2).string('Время');
        ws.cell(3, 3).string('Маршрут');
        ws.cell(3, 4).string('Пассажир');
        ws.cell(3, 5).string('Комментарий');
        ws.cell(3, 6).string('Сумма');

        ws.cell(3, 1, 3, 6).style(wb.createStyle({ font: { bold: true }, alignment: { vertical: 'center' } }))

        const data = dataArray;
        let currentRow = 4;
        let totalSum = 0;

        data.forEach(item => {

            ws.cell(currentRow, 1).string(String(item[0]));
            ws.cell(currentRow, 2).string(String(item[1]));
            ws.cell(currentRow, 3).string(String(item[2]));
            ws.cell(currentRow, 4).string(String(item[3]));
            ws.cell(currentRow, 5).string(String(item[4]));
            ws.cell(currentRow, 6).string(String(item[5]));

            totalSum += +item[5];

            currentRow++;
        })

        ws.cell(currentRow, 5).string('Общая сумма:');
        ws.cell(currentRow, 6).number(totalSum);

        ws.cell(3, 1, currentRow - 1, 6).style(wb.createStyle({
            border: {
                left: {
                    style: 'thin', //§18.18.3 ST_BorderStyle (Border Line Styles) ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot']
                    color: 'black' // HTML style hex value
                },
                right: {
                    style: 'thin',
                    color: 'black'
                },
                top: {
                    style: 'thin',
                    color: 'black'
                },
                bottom: {
                    style: 'thin',
                    color: 'black'
                },
            }
        }));

        ws.cell(currentRow, 5, currentRow, 6).style(wb.createStyle({
            border: {
                left: {
                    style: 'thin', //§18.18.3 ST_BorderStyle (Border Line Styles) ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot']
                    color: 'black' // HTML style hex value
                },
                right: {
                    style: 'thin',
                    color: 'black'
                },
                top: {
                    style: 'thin',
                    color: 'black'
                },
                bottom: {
                    style: 'thin',
                    color: 'black'
                },
            }
        }));

        currentRow++;
        currentRow++;

        // -------------------------------------------------

        const startDetailRow = currentRow;

        ws.cell(currentRow, 1).string('Заказчик:').style(wb.createStyle({ font: { bold: true } }));
        ws.cell(currentRow, 2, currentRow, 6, true).string(customer.name || '');
        currentRow++;

        ws.cell(currentRow, 1).string('Адрес:');
        ws.cell(currentRow, 2, currentRow, 6, true).string(customer.legal_address || '');
        currentRow++;

        ws.cell(currentRow, 1).string('ИНН:');
        ws.cell(currentRow, 2, currentRow, 6, true).string(customer.inn || '');
        currentRow++;

        ws.cell(currentRow, 1).string('БИК:');
        ws.cell(currentRow, 2).string(customer.bik || '');
        ws.cell(currentRow, 5, currentRow, 6, true).string(`ПРИНЯЛ___________________`);

        ws.cell(startDetailRow, 6, currentRow, 6).style(wb.createStyle({
            border: {
                right: {
                    style: 'thin',
                    color: 'black'
                }
            }
        }))

        currentRow++;
        // -------------------------------------------------------

        const startSecondDetailRow = currentRow;

        ws.cell(currentRow, 1).string('Исполнитель:').style(wb.createStyle({ font: { bold: true } }));
        ws.cell(currentRow, 2, currentRow, 6, true).string('ИП Орехова М.Ю.');
        currentRow++;

        ws.cell(currentRow, 1).string('Адрес:');
        ws.cell(currentRow, 2, currentRow, 6, true).string('г. Магнитогорск, пр-кт Ленина, д.85, офис 219 К/с 30101810400000000779');
        currentRow++;

        ws.cell(currentRow, 1).string('ИНН:');
        ws.cell(currentRow, 2, currentRow, 6, true).string('744511972706');
        currentRow++;

        ws.cell(currentRow, 1).string('БИК:');
        ws.cell(currentRow, 2).string('47501779');
        currentRow++;

        ws.cell(currentRow, 1).string('Счёт:');
        ws.cell(currentRow, 2, currentRow, 3, true).string('40802810390200001951 ОАО "Челябинвестбанк", г. Челябинск');
        ws.cell(currentRow, 5, currentRow, 6, true).string(`СДАЛ___________________`);

        ws.cell(startSecondDetailRow, 6, currentRow, 6).style(wb.createStyle({
            border: {
                right: {
                    style: 'thin',
                    color: 'black'
                }
            }
        }))

        ws.cell(startDetailRow, 1, currentRow, 6).style(wb.createStyle({
            fill: {
                type: 'pattern', // the only one implemented so far.
                patternType: 'solid', // most common.
                fgColor: 'white'
            }
        }));

        ws.cell(startDetailRow, 1, currentRow, 1).style(wb.createStyle({
            alignment: {
                horizontal: 'right'
            }
        }));

        ws.cell(currentRow, 1, currentRow, 6).style(wb.createStyle({
            border: {
                bottom: {
                    style: 'thin',
                    color: 'black'
                }
            }
        }))

        ws.cell(startDetailRow, 1, startDetailRow, 6).style(wb.createStyle({
            border: {
                top: {
                    style: 'thin',
                    color: 'black'
                },
            }
        }))

        ws.cell(startSecondDetailRow, 1, startSecondDetailRow, 6).style(wb.createStyle({
            border: {
                top: {
                    style: 'thin',
                    color: '000000'
                },
            }
        }))

        const fileName = `detailing-cars.${new Date().getTime()}.xlsx`;

        wb.write(path.join(__dirname, '..', 'uploads', fileName), (error, stats) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            resolve(fileName);
        });
    })
};