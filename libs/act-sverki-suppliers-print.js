// Require library
var excel = require('excel4node');
const path = require('path');

function main({
    saldoSum = 0,
    dataArray = [],
    period_left = '',
    period_right = '',
    supplier = {},
    sumOnPeriodEnd = null,
    currentDate = '',
    saldoDate = ''
} = {}) {
    return new Promise((resolve, reject) => {
        // if (!period)
        //     throw new Error('Отсутствует период для детализации');

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

        ws.column(1).setWidth(8);
        ws.column(2).setWidth(35);
        ws.column(3).setWidth(16);
        ws.column(4).setWidth(16);
        ws.column(5).setWidth(9);
        ws.column(6).setWidth(36);
        ws.column(7).setWidth(18);
        ws.column(8).setWidth(17);

        ws.row(5).setHeight(38);

        ws.cell(1, 1, 1, 8, true).string(`Акт сверки`).style({ ...titleStyle })
        ws.cell(2, 1, 2, 8, true).string(`Взаимных рассчётов по состоянию на ${period_right}`).style({ ...font12, ...hCenter });
        ws.cell(3, 1, 3, 8, true).string(`между ИП Орехова Мария Юрьевна и ${supplier.name}`).style({ ...font12, ...hCenter });
        ws.cell(4, 1, 4, 8, true).string(`${currentDate}`).style({ font: { size: 10, bold: true } });
        ws.cell(5, 1, 5, 8, true).string(`Мы, нижеподписавшиеся, ИП Орехова Мария Юрьевна с одной стороны и ${supplier.name} с другой стороны составили настоящий акт сверки в том, что состояние взаимных расчетов по данным учета следующее: между ИП Орехова Мария Юрьевна и ${supplier.name}`).style({ alignment: { wrapText: true, vertical: 'center' } });
        ws.cell(6, 1, 6, 4, true).string('По данным ИП Орехова Мария Юрьевна, руб.').style({ ...aroundBorder });
        ws.cell(6, 5, 6, 8, true).string(`По данным ${supplier.name}, руб.`).style({ ...aroundBorder });

        ws.cell(7, 1).string(`№ п/п`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 2).string(`Наименование операции, документы`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 3).string(`Списано (Дебет)`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 4).string(`Поступило (Кредит)`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });

        ws.cell(7, 5).string(`№ п/п`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 6).string(`Наименование операции, документы`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 7).string(`Списано (Дебет)`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 8).string(`Поступило (Кредит)`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });

        let row = 8;

        let totalCredit = 0;
        let totalDebet = 0;

        ws.cell(row, 1, row, 8).style({ border: { ...allBorder } });

        const isDebet = +saldoSum < 0;

        const debetCell = 3;
        const creditCell = 4;

        ws.cell(row, 2).string(`Остаток (сальдо) на ${saldoDate}`).style({ ...smallText });
        ws.cell(row, isDebet ? debetCell : creditCell).number(Math.abs(saldoSum)).style({ ...smallText, border: { ...allBorder }, ...hRight });

        ws.cell(row, 6).string(`Остаток (сальдо) на ${saldoDate}`).style({ ...smallText, });
        ws.cell(row, isDebet ? 8 : 7).number(Math.abs(saldoSum)).style({ ...smallText, ...hRight });

        row++;
        dataArray.forEach((data, index) => {


            ws.cell(row, 1, row, 8).style({ border: { ...allBorder } });

            ws.cell(row, 1).number(+index + 1).style({ ...smallText });
            ws.cell(row, 2).string(`${data[0]}`).style({ ...smallText });
            ws.cell(row, 3).string(`${data[2]}`).style({ ...smallText });
            ws.cell(row, 4).string(`${data[1]}`).style({ ...smallText });

            ws.cell(row, 5).string(`${index + 1}`).style({ ...smallText });
            ws.cell(row, 6).string(`${data[0]}`).style({ ...smallText });
            ws.cell(row, 7).string(`${data[1]}`).style({ ...smallText });
            ws.cell(row, 8).string(`${data[2]}`).style({ ...smallText });

            totalDebet += +data[2];
            totalCredit += +data[1];

            row++;
        });

        ws.cell(row, 2).string(`Обороты за период`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 3).string(`${totalDebet + (isDebet ? saldoSum : 0)}`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 4).string(`${totalCredit + (isDebet ? 0 : saldoSum)}`).style({ font: { size: 10, bold: true } });

        ws.cell(row, 6).string(`Обороты за период`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 7).string(`${totalCredit + (isDebet ? 0 : saldoSum)}`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 8).string(`${totalDebet + (isDebet ? saldoSum : 0)}`).style({ font: { size: 10, bold: true } });

        ws.cell(row, 1, row, 8).style({ border: { ...allBorder } });

        row++;

        ws.cell(row, 2).string(`Остаток (Сальдо) на ${period_right}`).style({ font: { size: 10, bold: true } });
        ws.cell(row, sumOnPeriodEnd < 0 ? debetCell : creditCell).string(`${Math.abs(sumOnPeriodEnd)}`).style({ font: { size: 10, bold: true } });

        ws.cell(row, 6).string(`Остаток (Сальдо) на ${period_right}`).style({ font: { size: 10, bold: true } });
        ws.cell(row, sumOnPeriodEnd < 0 ? 8 : 7).string(`${Math.abs(sumOnPeriodEnd)}`).style({ font: { size: 10, bold: true } });

        ws.cell(row, 1, row, 8).style({ border: { ...allBorder } });

        row++;

        ws.cell(row, 1, row, 2, true)
            .string('По данным ИП Орехова Мария Юрьевна').style({ ...smallText });
        ws.cell(row, 5, row, 6, true)
            .string(`По данным ${supplier.name}`).style({ ...smallText });

        row++;

        ws.cell(row, 1, row, 8, true).string('');

        row++;

        const ipName = 'ИП Орехова Мария Юрьевна';
        const polzaName = sumOnPeriodEnd < 0
            ? ipName
            : supplier.name;

        ws.cell(row, 1, row, 4, true)
            .string(`на ${period_right} задолженность в пользу ${polzaName} ${Math.abs(sumOnPeriodEnd)} руб.`)
            .style({ font: { size: 10, bold: true }, alignCenter: { ...wrapTrue } });

        ws.cell(row, 5, row, 8, true)
            .string(`на ${period_right} задолженность в пользу ${polzaName} ${Math.abs(sumOnPeriodEnd)} руб.`)
            .style({ font: { size: 10, bold: true }, alignCenter: { ...wrapTrue } });

        row++;

        ws.row(row).setHeight(40);

        ws.cell(row, 1, row, 8, true)
            .string(`Просим подписать акт не позднее 30 календарных дней с даты составления и отправить его ИП Орехова Мария Юрьевна. Задолженность по акту, не подписанному в течение этого времени, считается подтвержденной со стороны ${supplier.name}.`)
            .style({ font: { size: 10 }, alignment: { ...wrapTrue, vertical: 'top' } });

        row++;

        ws.cell(row, 1, row, 2, true).string('От ИП Орехова Мария Юрьевна')
            .style({ font: { size: 10 } });
        ws.cell(row, 5, row, 6, true).string(`От ${supplier.name}`)
            .style({ font: { size: 10 } });

        row++;

        ws.cell(row, 1, row, 2, true).string('ИП Орехова Мария Юрьевна')
            .style({ font: { size: 10 } });

        ws.cell(row, 5, row, 6, true).string('Ответственное лицо')
            .style({ font: { size: 10 } });

        row++;

        ws.cell(row, 1, row, 3, true).style({ border: { bottom: { style: 'medium', color: 'black' } } });
        ws.cell(row, 5, row, 7, true).style({ border: { bottom: { style: 'medium', color: 'black' } } });

        row++;

        ws.cell(row, 1).string('м.п.').style({ font: { size: 10 } });
        ws.cell(row, 5).string('м.п.').style({ font: { size: 10 } });

        const fileName = `act-sverki-suppliers.${new Date().getTime()}.xlsx`;

        wb.write(path.join(process.cwd(), 'uploads', fileName), (error, stats) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            resolve(fileName);
        });
    })
}

module.exports = main;