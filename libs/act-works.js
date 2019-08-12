// Require library
const excel = require('excel4node');
const path = require('path');
const Helpers = require('./Helpers');

function print({
    title = '',
    based = '',
    productName = '',
    productSum = 0,
    customer = {}
}) {

    return new Promise((resolve, reject) => {

        if (!customer.id) {
            throw new Error('Отсутствует заказчик');
        }

        if (!title) {
            throw new Error('Отсутствует title');
        }

        if (!based) {
            throw new Error('Отсутствует основание')
        }

        if (!productName) {
            throw new Error('Отсутствует наименование')
        }

        if (!productSum) {
            throw new Error('Отсутствует цена')
        }

        // Create a new instance of a Workbook class
        var wb = new excel.Workbook({
            defaultFont: {
                size: 9,
                name: 'Arial',
            },
        });

        const MEDIUM = 'medium';
        const THIN = 'thin';

        // Add Worksheets to the workbook
        var ws = wb.addWorksheet('Sheet 1');

        ws.column(1).setWidth(8);
        ws.column(2).setWidth(7);
        ws.column(3).setWidth(11);
        ws.column(4).setWidth(2);
        ws.column(5).setWidth(13);
        ws.column(6).setWidth(10);
        ws.column(7).setWidth(6);
        ws.column(8).setWidth(7);
        ws.column(9).setWidth(8);
        ws.column(10).setWidth(6);
        ws.column(11).setWidth(2);
        ws.column(12).setWidth(9);
        ws.column(13).setWidth(13);
        ws.column(14).setWidth(14);
        ws.column(15).setWidth(3);

        ws.row(1).setHeight(22);
        ws.row(2).setHeight(16);
        ws.row(3).setHeight(16);
        ws.row(4).setHeight(16);
        ws.row(5).setHeight(13);
        ws.row(6).setHeight(36);
        ws.row(8).setHeight(20);
        ws.row(15).setHeight(36);
        ws.row(18).setHeight(18);
        ws.row(19).setHeight(19);
        ws.row(23).setHeight(36);

        ws.cell(1, 1, 1, 15, true).string('');
        ws.cell(2, 4, 2, 11, true)
            .string(title)
            .style({ alignment: { horizontal: 'center' }, font: { bold: true, size: 12 } });

        ws.cell(3, 5, 3, 11, true)
            .string('на выполнение работ-услуг')
            .style({ alignment: { horizontal: 'center' }, font: { bold: true, size: 11 } });

        ws.cell(5, 2, 5, 3, true)
            .string('Основание:')
            .style({ alignment: { horizontal: 'left' } });

        ws.cell(5, 4, 5, 14, true)
            .string(based)
            .style({ alignment: { horizontal: 'left' } });

        ws.cell(6, 2, 6, 14, true)
            .string('Мы, нижеподписавшиеся,  представитель ИСПОЛНИТЕЛЯ, с одной стороны и представитель ЗАКАЗЧИКА с другой стороны, составили настоящий акт в том, что ИСПОЛНИТЕЛЬ выполнил, а ЗАКАЗЧИК ')
            .style({ alignment: { horizontal: 'left', wrapText: true } });

        ws.cell(8, 2, 8, 6, true)
            .string('Наименование')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(8, 7, 8, 8, true)
            .string('Ед.')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(8, 9, 8, 10, true)
            .string('Кол-во')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(8, 11, 8, 13, true)
            .string('Цена')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(8, 14)
            .string('Сумма')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(9, 2, 9, 6, true)
            .string('1')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(9, 7, 9, 8, true)
            .string('2')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(9, 9, 9, 10, true)
            .string('3')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(9, 11, 9, 13, true)
            .string('4')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(9, 14)
            .string('5')
            .style({ font: { bold: true, size: 10 }, alignment: { horizontal: 'center' } })

        // dyn field
        ws.cell(10, 2, 10, 6, true)
            .string(productName)
            .style({ font: { size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(10, 7, 10, 8, true)
            .string('')
            .style({ font: { size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(10, 9, 10, 10, true)
            .number(1)
            .style({ font: { size: 10 }, alignment: { horizontal: 'center' } })

        ws.cell(10, 11, 10, 13, true)
            .number(productSum)
            .style({ font: { size: 10 }, alignment: { horizontal: 'right' } })

        ws.cell(10, 14)
            .number(productSum)
            .style({ font: { size: 10 }, alignment: { horizontal: 'right' } })

        ws.cell(11, 2, 11, 13, true)
            .string('Итого:')
            .style({ font: { size: 10 }, alignment: { horizontal: 'left' } })


        ws.cell(11, 14)
            .number(productSum)
            .style({ font: { size: 10 }, alignment: { horizontal: 'right' } })

        ws.cell(12, 2, 12, 4, true)
            .string('Сумма прописью:')
            .style({ font: { size: 10 }, alignment: { horizontal: 'left' } })

        ws.cell(12, 5, 12, 14, true)
            .string(Helpers.sumToStr(productSum))
            .style({ font: { size: 10 }, alignment: { horizontal: 'left' } })

        ws.cell(15, 2, 15, 14, true)
            .string('Работы выполнены в полном объеме, в установленные сроки и с надлежащим качеством. Стороны претензий друг к другу не имеют.')
            .style({ font: { size: 10 }, alignment: { horizontal: 'left', vertical: 'top', wrapText: true } })

        ws.cell(17, 2, 17, 9, true)
            .string('Исполнитель: ИП Орехова Мария Юльевна')
            .style({ font: { size: 10 }, alignment: { vertical: 'bottom' } })

        ws.cell(17, 10, 17, 15, true)
            .string(`Заказчик: ${customer.name}`)
            .style({ font: { size: 10 }, alignment: { vertical: 'bottom' } })

        ws.cell(18, 2, 19, 9, true)
            .string('Адрес: 455021, Челябинская область, г.Магнитогорск, ул. Светлая 64')
            .style({ font: { size: 10 }, alignment: { wrapText: true, vertical: 'top' } })

        ws.cell(18, 10, 19, 15, true)
            .string('Адрес: ' + customer.address)
            .style({ font: { size: 10 }, alignment: { wrapText: true, vertical: 'top' } })

        ws.cell(20, 2, 20, 9, true)
            .string('ИНН: 744511972706')
            .style({ font: { size: 10 }, })

        ws.cell(20, 10, 20, 15, true)
            .string('ИНН: ' + customer.inn)
            .style({ font: { size: 10 }, })

        ws.cell(21, 2, 21, 9, true)
            .string('Расчетный счет: 40802810605500003872')
            .style({ font: { size: 10 }, })

        ws.cell(21, 10, 21, 15, true)
            .string('Расчетный счет: ' + customer.r_account)
            .style({ font: { size: 10 }, })

        ws.cell(22, 2, 22, 9, true)
            .string('Кор.счет: 30101810845250000999')
            .style({ font: { size: 10 }, })

        ws.cell(22, 10, 22, 15, true)
            .string('Кор.счет: ' + customer.k_account)
            .style({ font: { size: 10 }, })

        ws.cell(23, 2, 23, 9, true)
            .string('Банк: Точка ПАО БАНКА "ФК Открытие" г. Москва')
            .style({ font: { size: 10 }, alignment: { wrapText: true } })

        ws.cell(23, 10, 23, 15, true)
            .string('Банк: ' + customer.bank_name)
            .style({ font: { size: 10 }, alignment: { wrapText: true } })

        ws.cell(24, 2, 25, 9, true)
            .string('Бик: 044525999')
            .style({ font: { size: 9 }, alignment: { vertical: 'top' } })

        ws.cell(24, 10, 25, 15, true)
            .string('Бик: ' + customer.bik)
            .style({ font: { size: 9 }, alignment: { vertical: 'top' } })

        ws.cell(26, 2)
            .string('Сдал')
            .style({ font: { size: 10 }, })

        ws.cell(26, 3)
            .string('')
            .style({ font: { size: 10 }, border: { bottom: { style: THIN, color: 'black' } } })

        ws.cell(26, 10, 27, 11, true)
            .string('Принял')
            .style({ font: { size: 10 }, })

        ws.cell(26, 12)
            .string('')
            .style({ font: { size: 10 }, border: { bottom: { style: THIN, color: 'black' } } })

        ws.cell(8, 2, 11, 14)
            .style({
                border: {
                    top: { style: MEDIUM, color: 'black' },
                    bottom: { style: MEDIUM, color: 'black' },
                    right: { style: MEDIUM, color: 'black' },
                    left: { style: MEDIUM, color: 'black' }
                }
            });


        const fileName = `act-works.${new Date().getTime()}.xlsx`;

        wb.write(path.join(__dirname, '..', 'uploads', fileName), (error, stats) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            resolve(fileName);
        });
    })
}

print();

module.exports = print;