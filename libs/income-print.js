// Require library
const excel = require('excel4node');
const path = require('path');
const Helpers = require('./Helpers');

const XlsxPopulate = require('xlsx-populate');
const moment = require('moment');

const argsType = {
    id: '',
    created: null,
    sum: null,
    base: '',
    customer: {}
};

async function main({ id, created, customer, sum, base } = argsType) {

    const documentNumber = id;
    const documentCreated = moment(created).format('DD.MM.YYYY');
    const takeFrom = customer.is_legal_entity ? 'Юр. лицо' : 'Физ. лицо';
    const documentSum = sum;
    const sumLeft = documentSum.toString().split('.')[0];
    const sumRight = documentSum.toString().split('.')[1];

    const now = moment();
    const currentDate = now.format('DD');
    const currentMonth = now.format('MM');
    const currentYear = now.format('YY');

    const sumShort = `${sumLeft} руб. ${sumRight} коп`;

    const wb = await XlsxPopulate.fromFileAsync(__dirname + '/income-template.xlsx');

    wb.sheet("Sheet1").cell("AR15").value(documentNumber);
    wb.sheet("Sheet1").cell("AM21").value(sumShort);
    wb.sheet("Sheet1").cell("CM10").value(documentNumber);
    wb.sheet("Sheet1").cell("BB15").value(documentCreated);
    wb.sheet("Sheet1").cell("I23").value(takeFrom);
    wb.sheet("Sheet1").cell("BY14").value(takeFrom);
    wb.sheet("Sheet1").cell("F27").value(Helpers.sumToStr(documentSum));
    wb.sheet("Sheet1").cell("BQ23").value(Helpers.sumToStr(documentSum));
    wb.sheet("Sheet1").cell("BX16").value(base);
    wb.sheet("Sheet1").cell("I25").value(base);

    wb.sheet("Sheet1").cell("BV21").value(sumLeft);
    wb.sheet("Sheet1").cell("CM21").value(sumRight);

    wb.sheet("Sheet1").cell("BR29").value(currentDate);
    wb.sheet("Sheet1").cell("BU29").value(currentMonth);
    wb.sheet("Sheet1").cell("CF29").value(currentYear);

    const fileName = path.join(process.cwd(), 'uploads', 'income' + new Date().getTime() + '.xlsx');
    await wb.toFileAsync(fileName);

    return fileName;
}

module.exports = main;