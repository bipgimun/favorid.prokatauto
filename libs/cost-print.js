// Require library
const excel = require('excel4node');
const path = require('path');
const Helpers = require('./Helpers');

const XlsxPopulate = require('xlsx-populate');
const moment = require('moment');

async function main({
    id = '',
    created = '',
    sum = null,
    base = '',
} = {}) {

    const documentNumber = id;
    const documentCreated = moment(created).format('DD.MM.YYYY');
    const documentSum = sum;
    const sumLeft = documentSum.toString().split('.')[0];
    const sumRight = documentSum.toFixed(2).toString().split('.')[1];
    const sumShort = `${sumLeft} руб. ${sumRight} коп`;
    const now = moment();
    const currentDate = now.format('DD');
    const currentMonth = now.format('MM');
    const currentYear = now.format('YY');

    const wb = await XlsxPopulate.fromFileAsync(__dirname + '/cost-template.xlsx');

    wb.sheet('Sheet1').cell('AR10').value(documentNumber);
    wb.sheet('Sheet1').cell('BD10').value(documentCreated);
    wb.sheet('Sheet1').cell('AR15').value(sumShort);
    wb.sheet('Sheet1').cell('H19').value(base);
    wb.sheet('Sheet1').cell('E20').value(Helpers.sumToStr(sumLeft, false));
    wb.sheet('Sheet1').cell('BJ20').value(sumRight);
    wb.sheet('Sheet1').cell('F27').value(Helpers.sumToStr(sumLeft, false));
    wb.sheet('Sheet1').cell('BJ27').value(sumRight);
    wb.sheet('Sheet1').cell('B29').value(currentDate);
    wb.sheet('Sheet1').cell('E29').value(currentMonth);
    wb.sheet('Sheet1').cell('P29').value(currentYear);
    

    const file = path.join(process.cwd(), 'uploads', 'costs' + new Date().getTime() + '.xlsx');

    await wb.toFileAsync(file);

    return file;
}

module.exports = main;