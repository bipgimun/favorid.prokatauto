var excel = require('excel4node');
const path = require('path');

async function main({ dates = [], drivers = [], dataMap = {} }) {

    return new Promise((resolve, reject) => {
         const wb = new excel.Workbook({
        defaultFont: {
            size: 11,
            name: 'Calibri'
        },
    });


    const ws = wb.addWorksheet('Sheet 1');

    ws.cell(1, 1).string('Фамилия/Дата');
    const startCell = 2;

    dates.forEach((date, index) => {
        ws.cell(1, startCell + index).string(date);
    });

    const startRow = 2;

    drivers.forEach((driver, rowIndex) => {
        ws.cell(startRow + rowIndex, 1).string(driver);

        dates.forEach((date, cellIndex) => {
            if (dataMap.hasOwnProperty(date) && dataMap[date].hasOwnProperty(driver)) {
                ws.cell(startRow + rowIndex, startCell + cellIndex).string(dataMap[date][driver].join(','));
            }
        });
    });

    const fileName = `waybill-sheet.${new Date().getTime()}.xlsx`;
    const fullpath = path.join(__dirname, '..', 'uploads', fileName);
    wb.write(fullpath, (error, stats) => {
        if (error) {
            console.error(error);
            return reject(error);
        }

        return resolve(fullpath);
    });  
    })
}

module.exports = main;