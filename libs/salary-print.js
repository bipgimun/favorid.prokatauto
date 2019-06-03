// Require library
var excel = require('excel4node');
const path = require('path');

module.exports = ({
    period,
    dataArray,
    totalSum,
} = { period, dataArray, totalSum }) => {

    return new Promise((resolve, reject) => {
        if (!period)
            throw new Error('Отсутствует период для детализации');

        // Create a new instance of a Workbook class
        var wb = new excel.Workbook({
            defaultFont: {
                size: 11,
                name: 'Calibri'
            },
        });

        // Add Worksheets to the workbook
        var ws = wb.addWorksheet('Sheet 1');

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

        const textStyle = {
            font: {
                size: 11,
                bold: false,
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

        ws.column(1).setWidth(15);
        ws.column(2).setWidth(35);
        ws.column(3).setWidth(20);

        ws.row(1).setHeight(37);

        ws.cell(1, 1, 1, 3, true).string(`Зарплатная ведомость за ${period}`).style({ ...titleStyle, ...aroundBorder });
        ws.cell(2, 1, 2, 2, true).string(`Общая сумма:`).style({ ...thStyle, ...aroundBorder, ...hRight});
        ws.cell(2, 3).number(totalSum).style({ ...hCenter, ...aroundBorder, ...bold });

        let row = 3;

        dataArray.forEach((item) => {

            const { driver, total, details } = item;

            ws.cell(row, 1).string(`Водитель`).style({ ...aroundBorder, ...bold });
            ws.cell(row, 2, row, 3, true).string(driver).style({ ...aroundBorder });

            row++;

            ws.cell(row, 1, row, 2, true).string('Общая сумма по водителю:').style({ ...aroundBorder, ...thStyle, ...hRight });
            ws.cell(row, 3).number(total).style({ ...aroundBorder, ...thStyle, ...hCenter });

            row++;
            ws.cell(row, 1).string('Дата').style({ ...aroundBorder, ...thStyle, ...hCenter });
            ws.cell(row, 2).string('Причина').style({ ...aroundBorder, ...thStyle, ...hCenter });
            ws.cell(row, 3).string('Сумма, руб').style({ ...aroundBorder, ...thStyle, ...hCenter });

            row++;

            details.forEach(([date, reason, sum]) => {
                ws.cell(row, 1).string(date).style({ ...hCenter, ...aroundBorder });
                ws.cell(row, 2).string(reason).style({ ...hCenter, ...aroundBorder });
                ws.cell(row, 3).number(sum).style({ ...hCenter, ...aroundBorder });

                row++;
            });
        });

        const fileName = `salary-detail.${new Date().getTime()}.xlsx`;

        wb.write(path.join(__dirname, '..', 'uploads', fileName), (error, stats) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            resolve(fileName);
        });
    })
};