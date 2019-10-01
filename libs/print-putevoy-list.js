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

async function main({
    id = '',
    time_min = '',
    time_max = '',
    driver = {},
    customer = {},
    shift = {}
}) {
    
    // const documentNumber = id;
    // const documentCreated = moment(created).format('DD.MM.YYYY');
    // const takeFrom = customer.is_legal_entity ? 'Юр. лицо' : 'Физ. лицо';
    // const documentSum = sum;
    // const sumLeft = documentSum.toString().split('.')[0];
    // const sumRight = documentSum.toString().split('.')[1];

    // const now = moment();
    // const currentDate = now.format('DD');
    // const currentMonth = now.format('MM');
    // const currentYear = now.format('YY');

    // const sumShort = `${sumLeft} руб. ${sumRight} коп`;

    const [secondname, firstname, thirdname] = driver.name.split(' ');

    const wb = await XlsxPopulate.fromFileAsync(__dirname + '/putevoy-list-template.xlsx');

    const documentTitle = `ПУТЕВОЙ ЛИСТ № ${id} \n с ${new Date(shift.date_start).getDate()} по____  ________________${new Date(shift.date_start).getFullYear()}г.`
    const documentTitle2 = `ТАЛОН ЗАКАЗЧИКА К ПУТЕВОМУ ЛИСТУ № ${id} \n с ${new Date(shift.date_start).getDate()} по____ ________________${new Date(shift.date_start).getFullYear()}г.`;

    wb.sheet("Sheet1").cell("A1").value(documentTitle);
    wb.sheet("Sheet1").cell("E3").value(secondname || '');
    wb.sheet("Sheet1").cell("E4").value(firstname || '');
    wb.sheet("Sheet1").cell("E5").value(thirdname || '');
    wb.sheet("Sheet1").cell("E6").value(driver.driver_license);
    wb.sheet("Sheet1").cell("A28").value(customer.name);
    wb.sheet("Sheet1").cell("A33").value(documentTitle2);
    wb.sheet("Sheet1").cell("D38").value(driver.name);
    wb.sheet("Sheet1").cell("D41").value(customer.name);

    const fileName = path.join(process.cwd(), 'uploads', 'pl-' + id + '.xlsx');
    await wb.toFileAsync(fileName);

    return fileName;
}

module.exports = main;