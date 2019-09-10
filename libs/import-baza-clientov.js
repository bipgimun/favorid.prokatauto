const XLSX = require('xlsx');

const wb = XLSX.readFile(__dirname + '/baza-klientov.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];

const sheetData = XLSX.utils.sheet_to_json(sheet, { raw: false });

const v = sheetData.map(data => {
    if (!data['ФИО']) {
        return;
    }

    return data;
})
    .filter(item => !!item)
    .map(data => {

        /** @var phone {String} */
        let phone = data['Контактный номер']
            ? data['Контактный номер'].replace(/\D/g, '')
            : 'NULL';

        phone = /^8\d{3}\d{7}$/.test(phone)
            ?  `'${phone.replace(/^8(\d{3})(\d{3})(\d{2})(\d{2})$/, '+7($1) $2-$3-$4')}'`
            : 'NULL';

        const bdate = data['Дата рождения'] 
            ? `'${data['Дата рождения'] }'`
            : 'NULL';

        return `('${data['ФИО'].trim()}', ${phone}, ${bdate})`;
    })

const insertQ = `INSERT INTO passengers (name, contact_number, birthday) VALUES \n${v.join(',\n')};`;

console.log(insertQ);