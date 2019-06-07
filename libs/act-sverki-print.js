// Require library
var excel = require('excel4node');
const path = require('path');

module.exports = ({
    saldoSum = 0,
    dataArray = [],
    period_left = '',
    period_right = '',
    customer = {},
    currentDate = '',
    saldoDate = ''
} = {}) => {

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
        ws.cell(3, 1, 3, 8, true).string(`между ИП Орехова Мария Юрьевна и ${customer.name}`).style({ ...font12, ...hCenter });
        ws.cell(4, 1, 4, 8, true).string(`${currentDate}`).style({ font: { size: 10, bold: true } });
        ws.cell(5, 1, 5, 8, true).string(`Мы, нижеподписавшиеся, ИП Орехова Мария Юрьевна с одной стороны и ${customer.name} с другой стороны составили настоящий акт сверки в том, что состояние взаимных расчетов по данным учета следующее: между ИП Орехова Мария Юрьевна и ${customer.name}`).style({ alignment: { wrapText: true, vertical: 'center' } });
        ws.cell(6, 1, 6, 4, true).string('По данным ИП Орехова Мария Юрьевна, руб.').style({ ...aroundBorder });
        ws.cell(6, 5, 6, 8, true).string(`По данным ${customer.name}, руб.`).style({ ...aroundBorder });

        ws.cell(7, 1).string(`№ п/п`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 2).string(`Наименование операции, документы`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 3).string(`Списано (Дебет)`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 4).string(`Поступило (Кредит)`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });

        ws.cell(7, 5).string(`№ п/п`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 6).string(`Наименование операции, документы`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 7).string(`Списано (Дебет)`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });
        ws.cell(7, 8).string(`Поступило (Кредит)`).style({ ...thStyle, ...aroundBorder, alignment: { ...wrapTrue, ...alignCenter } });

        let row = 8;

        let totalDebet = 0;
        let totalCredit = 0;

        ws.cell(row, 1, row, 8).style({ border: { ...allBorder } });

        ws.cell(row, 2).string(`Остаток (сальдо) на ${period_left}`).style({ ...smallText });
        ws.cell(row, 3).string(`${saldoSum}`).style({ ...smallText, border: { ...allBorder }, ...hRight });

        ws.cell(row, 6).string(`Остаток (сальдо) на ${period_left}`).style({ ...smallText, });
        ws.cell(row, 8).string(`${saldoSum}`).style({ ...smallText, ...hRight });

        row++;

        dataArray.forEach((data, index) => {

            ws.cell(row, 1, row, 8).style({ border: { ...allBorder } });

            ws.cell(row, 1).string(`${index + 1}`).style({ ...smallText });
            ws.cell(row, 2).string(`${data[0]}`).style({ ...smallText });
            ws.cell(row, 3).string(`${data[1]}`).style({ ...smallText });
            ws.cell(row, 4).string(`${data[2]}`).style({ ...smallText });

            ws.cell(row, 5).string(`${index + 1}`).style({ ...smallText });
            ws.cell(row, 6).string(`${data[0]}`).style({ ...smallText });
            ws.cell(row, 7).string(`${data[2]}`).style({ ...smallText });
            ws.cell(row, 8).string(`${data[1]}`).style({ ...smallText });

            totalDebet += +data[1];
            totalCredit += +data[2];

            row++;
        });

        ws.cell(row, 2).string(`Обороты за период`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 3).string(`${totalDebet}`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 4).string(`${totalCredit}`).style({ font: { size: 10, bold: true } });

        ws.cell(row, 6).string(`Обороты за период`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 7).string(`${totalCredit}`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 8).string(`${totalDebet}`).style({ font: { size: 10, bold: true } });

        ws.cell(row, 1, row, 8).style({ border: { ...allBorder } });

        row++;

        ws.cell(row, 2).string(`Остаток (Сальдо) на ${saldoDate}`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 3).string(`${saldoSum - (totalDebet - totalCredit)}`).style({ font: { size: 10, bold: true } });

        ws.cell(row, 6).string(`Остаток (Сальдо) на ${saldoDate}`).style({ font: { size: 10, bold: true } });
        ws.cell(row, 8).string(`${saldoSum - (totalDebet - totalCredit)}`).style({ font: { size: 10, bold: true } });

        ws.cell(row, 1, row, 8).style({ border: { ...allBorder } });

        row++;

        ws.cell(row, 1, row, 2, true).string('По данным ИП Орехова Мария Юрьевна').style({ ...smallText });
        ws.cell(row, 5, row, 6, true).string(`По данным ${customer.name}`).style({ ...smallText });

        row++;

        ws.cell(row, 1, row, 8, true).string('');

        row++;

        ws.cell(row, 1, row, 4, true).string(`на ${saldoDate} задолженность в пользу ИП Орехова Мария Юрьевна ${saldoSum - (totalDebet - totalCredit)} руб.`)
            .style({ font: { size: 10, bold: true }, alignCenter: { ...wrapTrue } });

        ws.cell(row, 5, row, 8, true).string(`на ${saldoDate} задолженность в пользу ИП Орехова Мария Юрьевна ${saldoSum - (totalDebet - totalCredit)} руб.`)
            .style({ font: { size: 10, bold: true }, alignCenter: { ...wrapTrue } });

        row++;

        ws.row(row).setHeight(40);

        ws.cell(row, 1, row, 8, true).string(`Просим подписать акт не позднее 30 календарных дней с даты составления и отправить его ИП Орехова Мария Юрьевна. Задолженность по акту, не подписанному в течение этого времени, считается подтвержденной со стороны ${customer.name}.`)
            .style({ font: { size: 10 }, alignment: { ...wrapTrue, vertical: 'top' } });

        row++;

        ws.cell(row, 1, row, 2, true).string('От ИП Орехова Мария Юрьевна')
            .style({ font: { size: 10 } });
        ws.cell(row, 5, row, 6, true).string(`От ${customer.name}`)
            .style({ font: { size: 10 } });

        row++;

        ws.cell(row, 1, row, 2, true).string('ИП Орехова Мария Юрьевна')
            .style({ font: { size: 10 } });
        ws.cell(row, 5, row, 6, true).string('*ВСТАВИТЬ ДОЛЖНОСТЬ И ФИО*')
            .style({ font: { size: 10 } });

        row++;

        ws.cell(row, 1, row, 3, true).style({ border: { bottom: { style: 'medium', color: 'black' } } });
        ws.cell(row, 5, row, 7, true).style({ border: { bottom: { style: 'medium', color: 'black' } } });

        row++;

        ws.cell(row, 1).string('м.п.').style({ font: { size: 10 } });
        ws.cell(row, 5).string('м.п.').style({ font: { size: 10 } });

        const fileName = `act-sverki.${new Date().getTime()}.xlsx`;

        wb.write(path.join(__dirname, '..', 'uploads', fileName), (error, stats) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            resolve(fileName);
        });
    })
};