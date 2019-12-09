const excel = require('excel4node');
const path = require('path');
const moment = require('moment');

function main({
    timeMin = '',
    timeMax = '',
    unitTitle = '',
    unitName = '',
    balanceAtStartPeriod = 0,
    balanceAtEndPeriod = 0,
    balanceAtNow = 0,
    operations = []
} = {}) {
    return new Promise((resolve, reject) => {

        // Create a new instance of a Workbook class
        var wb = new excel.Workbook({
            defaultFont: {
                size: 11,
                name: 'Calibri'
            },
        });

        // Add Worksheets to the workbook
        var ws = wb.addWorksheet('Лист 1');

        const titleStyle = {
            font: {
                size: 14,
                bold: true,
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center'
            }
        };

        const font12 = {
            font: {
                size: 12
            }
        }

        const textStyle = {
            font: {
                size: 11,
                bold: false,
            }
        };

        const smallText = {
            font: {
                size: 10
            }
        };

        const thStyle = {
            font: {
                size: 12,
                bold: true,
            }
        };

        const aroundBorder = {
            border: {
                right: {
                    style: 'medium',
                    color: 'black'
                },
                bottom: {
                    style: 'medium',
                    color: 'black'
                },
                left: {
                    style: 'medium',
                    color: 'black'
                },
                top: {
                    style: 'medium',
                    color: 'black'
                },
            }
        };

        const hCenter = {
            alignment: {
                horizontal: 'center'
            }
        };

        const hRight = {
            alignment: {
                horizontal: 'right'
            }
        }

        const bold = {
            font: {
                bold: true
            }
        };

        const alignCenter = {
            vertical: 'center',
            horizontal: 'center'
        };

        const wrapTrue = {
            wrapText: true
        }

        const thinBorder = {
            style: 'thin'
        };

        const allBorder = {
            right: {
                style: 'thin',
                color: 'black'
            },
            bottom: {
                style: 'thin',
                color: 'black'
            },
            left: {
                style: 'thin',
                color: 'black'
            },
            top: {
                style: 'thin',
                color: 'black'
            },
        };

        ws.column(1).setWidth(20);
        ws.column(2).setWidth(45);
        ws.column(3).setWidth(15);
        ws.column(4).setWidth(15);
        ws.column(5).setWidth(25);

        let titleUnitValue = '';

        if (unitName == 'APR') {
            titleUnitValue = 'апартаментов';
        } else if (unitName == 'CAR') {
            titleUnitValue = 'авто';
        } else if (unitName == 'MUZ') {
            titleUnitValue = 'муниципала';
        }

        ws.cell(1, 1, 1, 5, true)
            .string(`Рентабельность ${titleUnitValue} - ${unitTitle}`)
            .style({ border: { ...allBorder }, alignment: { ...alignCenter }, font: { size: 14, bold: true } });

        ws.cell(2, 1, 2, 5, true)
            .string(`С ${timeMin}-${timeMax}`)
            .style({ border: { ...allBorder }, alignment: { ...alignCenter }, font: { size: 11 } });

        ws.cell(3, 1, 3, 2, true)
            .string(`Баланс на данный момент:`)
            .style({ border: { ...allBorder }, alignment: { horizontal: 'right' }, font: { size: 11, bold: true } });

        ws.cell(3, 3, 3, 5, true)
            .string(`${balanceAtNow} рублей`)
            .style({ border: { ...allBorder }, alignment: { horizontal: 'left' }, font: { size: 11, bold: true } });

        ws.cell(4, 1, 4, 2, true)
            .string(`Баланс на начало периода:`)
            .style({ border: { ...allBorder }, alignment: { horizontal: 'right' }, font: { size: 11, bold: true } });

        ws.cell(4, 3, 4, 5, true)
            .string(`${balanceAtStartPeriod} рублей`)
            .style({ border: { ...allBorder }, alignment: { horizontal: 'left' }, font: { size: 11, bold: true } });

        ws.cell(5, 1)
            .string(`Дата`)
            .style({ border: { ...allBorder }, font: { size: 11, bold: true } });

        ws.cell(5, 2)
            .string(`Кому/От кого`)
            .style({ border: { ...allBorder }, font: { size: 11, bold: true } });

        ws.cell(5, 3)
            .string(`Приход, руб.`)
            .style({ border: { ...allBorder }, font: { size: 11, bold: true } });

        ws.cell(5, 4)
            .string(`Расход, руб.`)
            .style({ border: { ...allBorder }, font: { size: 11, bold: true } });

        ws.cell(5, 5)
            .string(`Основание`)
            .style({ border: { ...allBorder }, font: { size: 11, bold: true } });

        let currentRow = 5;

        operations.forEach((item) => {
            currentRow++;

            ws.cell(currentRow, 1)
                .string(moment(item.date).format('DD.MM.YYYY'))
                .style({ border: { ...allBorder } });

            ws.cell(currentRow, 2)
                .string(item.from || '')
                .style({ border: { ...allBorder }, alignment: { ...wrapTrue } });

            ws.cell(currentRow, 3)
                .string(`${item.income ? item.sum : ''}`)
                .style({ border: { ...allBorder } });

            ws.cell(currentRow, 4)
                .string(`${!item.income ? item.sum : ''}`)
                .style({ border: { ...allBorder } });

            ws.cell(currentRow, 5)
                .string(`Документ ${item.income ? 'прихода' : 'расхода'} №${item.id}`)
                .style({ border: { ...allBorder }, alignment: { ...wrapTrue } });
        });

        currentRow++

        ws.cell(currentRow, 1, currentRow, 2, true)
            .string(`Баланс на конец периода:`)
            .style({ border: { ...allBorder }, alignment: { horizontal: 'right' }, font: { size: 11, bold: true } });

        ws.cell(currentRow, 3, currentRow, 5, true)
            .string(`${balanceAtEndPeriod} руб`)
            .style({ border: { ...allBorder }, alignment: { horizontal: 'left' } });

        const fileName = `unit-profit.${new Date().getTime()}.xlsx`;
        const filePath = path.join(__dirname, '..', 'uploads', fileName);

        wb.write(filePath, (error, stats) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            resolve(filePath);
        });
    })
}

module.exports = main;