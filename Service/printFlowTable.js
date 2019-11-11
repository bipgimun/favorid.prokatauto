const excel = require('excel4node');
const path = require('path');
const moment = require('moment');

function main({
    timeMin = '',
    timeMax = '',
    cashboxName = '',
    balanceAtStartPeriod = 0,
    balanceAtEndPeriod = 0,
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

        ws.cell(1, 1, 1, 5, true)
            .string(`Отчет о движении денежных средств с ${timeMin} по ${timeMax}`)
            .style({ border: { ...allBorder }, alignment: { ...alignCenter }, font: { size: 14, bold: true } });

        ws.cell(2, 1)
            .string(`По кассе / счету:`)
            .style({ border: { ...allBorder }, alignment: { ...alignCenter } });

        ws.cell(2, 2, 2, 5, true)
            .string(`${cashboxName || 'По всем'}`)
            .style({ border: { ...allBorder }, alignment: { ...alignCenter } });

        ws.cell(3, 1, 3, 3, true)
            .string(`Остаток на начало периода:`)
            .style({ border: { ...allBorder }, alignment: { ...alignCenter }, font: { size: 12, bold: true } });

        ws.cell(3, 4, 3, 5, true)
            .string(`${balanceAtStartPeriod} руб`)
            .style({ border: { ...allBorder }, alignment: { ...alignCenter } });

        ws.cell(4, 1)
            .string(`Дата`)
            .style({ border: { ...allBorder } });

        ws.cell(4, 2)
            .string(`Кому/От кого`)
            .style({ border: { ...allBorder } });

        ws.cell(4, 3)
            .string(`Приход, руб.`)
            .style({ border: { ...allBorder } });

        ws.cell(4, 4)
            .string(`Расход, руб.`)
            .style({ border: { ...allBorder } });

        ws.cell(4, 5)
            .string(`Касса/счет`)
            .style({ border: { ...allBorder } });

        let currentRow = 4;

        operations.sort((a, b) => a.date > b.date ? 1 : -1).forEach((item) => {
            currentRow++;

            ws.cell(currentRow, 1)
                .string(moment(item.date).format('DD.MM.YYYY'))
                .style({ border: { ...allBorder } });

            ws.cell(currentRow, 2)
                .string(item.sourceDir || '')
                .style({ border: { ...allBorder }, alignment: { ...wrapTrue } });

            ws.cell(currentRow, 3)
                .string(`${item.income_sum || ''}`)
                .style({ border: { ...allBorder } });

            ws.cell(currentRow, 4)
                .string(`${item.cost_sum || ''}`)
                .style({ border: { ...allBorder } });

            ws.cell(currentRow, 5)
                .string(item.cashStorageName || '')
                .style({ border: { ...allBorder }, alignment: { ...wrapTrue } });
        });

        currentRow++

        ws.cell(currentRow, 1, currentRow, 3, true)
            .string(`Остаток на конец периода:`)
            .style({ border: { ...allBorder }, alignment: { ...alignCenter }, font: { size: 12, bold: true } });

        ws.cell(currentRow, 4, currentRow, 5, true)
            .string(`${balanceAtEndPeriod} руб`)
            .style({ border: { ...allBorder }, alignment: { ...alignCenter } });

        const fileName = `act-sverki.${new Date().getTime()}.xlsx`;
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