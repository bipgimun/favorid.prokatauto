var ejs = require('ejs');
const path = require('path');
const fs = require('fs');

module.exports = {

    sumToStr(sum, printKop = true) {
        sum = +sum;
        var mapNumbers = {
            0: [2, 1, "ноль"],
            1: [0, 2, "один", "одна"],
            2: [1, 2, "два", "две"],
            3: [1, 1, "три"],
            4: [1, 1, "четыре"],
            5: [2, 1, "пять"],
            6: [2, 1, "шесть"],
            7: [2, 1, "семь"],
            8: [2, 1, "восемь"],
            9: [2, 1, "девять"],
            10: [2, 1, "десять"],
            11: [2, 1, "одиннадцать"],
            12: [2, 1, "двенадцать"],
            13: [2, 1, "тринадцать"],
            14: [2, 1, "четырнадцать"],
            15: [2, 1, "пятнадцать"],
            16: [2, 1, "шестнадцать"],
            17: [2, 1, "семнадцать"],
            18: [2, 1, "восемнадцать"],
            19: [2, 1, "девятнадцать"],
            20: [2, 1, "двадцать"],
            30: [2, 1, "тридцать"],
            40: [2, 1, "сорок"],
            50: [2, 1, "пятьдесят"],
            60: [2, 1, "шестьдесят"],
            70: [2, 1, "семьдесят"],
            80: [2, 1, "восемьдесят"],
            90: [2, 1, "девяносто"],
            100: [2, 1, "сто"],
            200: [2, 1, "двести"],
            300: [2, 1, "триста"],
            400: [2, 1, "четыреста"],
            500: [2, 1, "пятьсот"],
            600: [2, 1, "шестьсот"],
            700: [2, 1, "семьсот"],
            800: [2, 1, "восемьсот"],
            900: [2, 1, "девятьсот"]
        };

        var mapOrders = [
            { _Gender: true, _arrStates: ["рубль", "рубля", "рублей"] },
            { _Gender: false, _arrStates: ["тысяча", "тысячи", "тысяч"] },
            { _Gender: true, _arrStates: ["миллион", "миллиона", "миллионов"] },
            { _Gender: true, _arrStates: ["миллиард", "миллиарда", "миллиардов"] },
            { _Gender: true, _arrStates: ["триллион", "триллиона", "триллионов"] }
        ];

        var objKop = { _Gender: false, _arrStates: ["копейка", "копейки", "копеек"] };

        function Value(dVal, bGender) {
            var xVal = mapNumbers[dVal];
            if (xVal[1] == 1) {
                return xVal[2];
            } else {
                return xVal[2 + (bGender ? 0 : 1)];
            }
        }

        function From0To999(fValue, oObjDesc, fnAddNum, fnAddDesc) {
            var nCurrState = 2;
            if (Math.floor(fValue / 100) > 0) {
                var fCurr = Math.floor(fValue / 100) * 100;
                fnAddNum(Value(fCurr, oObjDesc._Gender));
                nCurrState = mapNumbers[fCurr][0];
                fValue -= fCurr;
            }

            if (fValue < 20) {
                if (Math.floor(fValue) > 0) {
                    fnAddNum(Value(fValue, oObjDesc._Gender));
                    nCurrState = mapNumbers[fValue][0];
                }
            } else {
                var fCurr = Math.floor(fValue / 10) * 10;
                fnAddNum(Value(fCurr, oObjDesc._Gender));
                nCurrState = mapNumbers[fCurr][0];
                fValue -= fCurr;

                if (Math.floor(fValue) > 0) {
                    fnAddNum(Value(fValue, oObjDesc._Gender));
                    nCurrState = mapNumbers[fValue][0];
                }
            }

            fnAddDesc(oObjDesc._arrStates[nCurrState]);
        }

        function FloatToSamplesInWordsRus(fAmount) {
            var fInt = Math.floor(fAmount + 0.005);
            var fDec = Math.floor(((fAmount - fInt) * 100) + 0.5);

            var arrRet = [];
            var iOrder = 0;
            var arrThousands = [];
            for (; fInt > 0.9999; fInt /= 1000) {
                arrThousands.push(Math.floor(fInt % 1000));
            }
            if (arrThousands.length == 0) {
                arrThousands.push(0);
            }

            function PushToRes(strVal) {
                arrRet.push(strVal);
            }

            for (var iSouth = arrThousands.length - 1; iSouth >= 0; --iSouth) {
                if (arrThousands[iSouth] == 0) {
                    continue;
                }
                From0To999(arrThousands[iSouth], mapOrders[iSouth], PushToRes, PushToRes);
            }

            if (arrThousands[0] == 0) {
                //  Handle zero amount
                if (arrThousands.length == 1) {
                    PushToRes(Value(0, mapOrders[0]._Gender));
                }

                var nCurrState = 2;
                PushToRes(mapOrders[0]._arrStates[nCurrState]);
            }

            if (arrRet.length > 0) {
                // Capitalize first letter
                arrRet[0] = arrRet[0].match(/^(.)/)[1].toLocaleUpperCase() + arrRet[0].match(/^.(.*)$/)[1];
            }
            if (printKop) {

                arrRet.push((fDec < 10) ? ("0" + fDec) : ("" + fDec));

                From0To999(fDec, objKop, function () { }, PushToRes);
            }

            return arrRet.join(" ");
        }

        return FloatToSamplesInWordsRus(sum);
    },

    getFilesFromDirectoryWithRecursive(dir) {
        const files = [];

        traverseDir(dir);

        function traverseDir(dir, subdir = '') {
            fs.readdirSync(dir).forEach(file => {
                let fullPath = path.join(dir, file);
                const relativePath = `${subdir}/${file}`;

                if (fs.lstatSync(fullPath).isDirectory()) {
                    traverseDir(fullPath, relativePath);
                } else {
                    files.push(relativePath);
                }
            });
        }

        return files;
    },


    getRandomNumber(count, k) {
        var _sym = '1234567890';
        var str = '';

        for (var i = 0; i < count; i++) {
            str += _sym[parseInt(Math.random() * (_sym.length))];
        }

        return str;
    },

    translite(str) {
        var arr = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'g', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'ы': 'i', 'э': 'e', 'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'G', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Ы': 'I', 'Э': 'E', 'ё': 'yo', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ь': '', 'ю': 'yu', 'я': 'ya', 'Ё': 'YO', 'Х': 'H', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHCH', 'Ъ': '', 'Ь': '',
            'Ю': 'YU', 'Я': 'YA'
        };
        var replacer = function (a) { return arr[a] || a };
        return str.replace(/[А-яёЁ]/g, replacer)
    },

    buildTree(dataset = []) {

        const resultTreeObj = {};

        dataset.forEach((treeItem) => {
            resultTreeObj[treeItem.id] = treeItem;
        })

        function getTree(dataset) {
            let tree = {};

            for (let key in dataset) {
                let node = dataset[key];

                if (!node['parent_id']) {
                    tree[key] = node;
                }
                else {
                    if (!!dataset[node['parent_id']]['childs'] === false) dataset[node['parent_id']]['childs'] = {};

                    dataset[node['parent_id']]['childs'][key] = node;
                }
            }

            return tree;
        }

        return getTree(resultTreeObj);
    },

    formatPrice(data) {
        let price = Number.prototype.toFixed.call(parseFloat(data) || 0, 2),
            //заменяем точку на запятую
            price_sep = price.replace(/(\D)/g, ",");
        //добавляем пробел как разделитель в целых
        price_sep = price_sep.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");

        return price_sep;
    },

    // вывод даты в заданном формате
    formatDate(date = false, format) {

        if (!!date === false) return '';

        var resultDateTime = format;

        var regUnix = /^[0-9]+$/;

        var dateIsUnix = regUnix.test(date);

        if (dateIsUnix) {
            date = Number(date);
        }

        var d = new Date(date);

        var monthsLong = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
        var monthsShort = ["Янв.", "Февр.", "Март", "Апр.", "Май", "Июнь", "Июль", "Авг.", "Сен.", "Окт.", "Ноя.", "Дек."];
        var daysLong = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
        var daysShort = ["Пн.", "Вт.", "Ср.", "Чт.", "Пт.", "Сб.", "Вс."];

        var yearRegExp = d.getFullYear();
        var monthRegExp = (String(d.getMonth() + 1).length == 1) ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
        var lognMonthRegExp = monthsLong[d.getMonth()];
        var dayRegExp = (d.getDate().toString().length == 1) ? ("0" + d.getDate()) : d.getDate();
        var dayNameRegExp = (d.getDay() == 0) ? (6) : (d.getDay() - 1);

        var hoursRegExp = (d.getHours().toString().length == 1) ? ("0" + d.getHours()) : d.getHours();
        var minuteRegExp = (d.getMinutes().toString().length == 1) ? ("0" + d.getMinutes()) : d.getMinutes();
        var secondsRegExp = (d.getSeconds().toString().length == 1) ? ("0" + d.getSeconds()) : d.getSeconds();
        var milisecondsRegExp = (d.getMilliseconds().toString().length == 1) ? ("00" + d.getMilliseconds()) : ((d.getMilliseconds().toString().length == 2) ? ("0" + d.getMilliseconds()) : d.getMilliseconds());

        resultDateTime = resultDateTime.replace(new RegExp('yyyy', 'g'), yearRegExp);
        resultDateTime = resultDateTime.replace(new RegExp('yy', 'g'), String(yearRegExp).slice(-2));
        resultDateTime = resultDateTime.replace(new RegExp('MMMM', 'g'), lognMonthRegExp);
        resultDateTime = resultDateTime.replace(new RegExp('MM', 'g'), monthRegExp);
        resultDateTime = resultDateTime.replace(new RegExp('dddd', 'g'), daysLong[dayNameRegExp]);
        resultDateTime = resultDateTime.replace(new RegExp('ddd', 'g'), daysShort[dayNameRegExp]);
        resultDateTime = resultDateTime.replace(new RegExp('dd', 'g'), dayRegExp);
        resultDateTime = resultDateTime.replace(new RegExp('hh', 'g'), hoursRegExp);
        resultDateTime = resultDateTime.replace(new RegExp('mm', 'g'), minuteRegExp);
        resultDateTime = resultDateTime.replace(new RegExp('ss', 'g'), secondsRegExp);
        resultDateTime = resultDateTime.replace(new RegExp('zz', 'g'), milisecondsRegExp);

        return `${resultDateTime}`;
    },

    /* заменяет переносы строк указанным разделителем (по умолчанию '<br />') */
    replaceLineBreaks: (str, divider = `p`) => {

        if (!str) return '';

        var res = ``;

        switch (divider) {
            case 'br':
                divider = `<br>`;
                res = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + divider + '$2');
                break;

            case 'p':
                res = '<p>' + (str + '').replace(/\r?\n/g, '</p><p>') + '</p>';
                break;
        }


        res = res.replace(/<p><\/p>/g, '');
        return res;
    },

    /* обрезает строку до заданной длины, (по умолчанию - 100 знаков) */
    trimStr: (str, length) => {
        if (str == null) return '';
        length = length || 100;
        str = str.replace(/<\/?[^>]+>/g, '');
        if (str.length > length) return str.substr(0, length - 1) + '...';
        return str;

    },

    trimTags(str = '') {
        return str.replace(/<\/?[^>]+>/g, '');
    },

    trimByWords(str, length) {
        var str = str || '';

        str = this.trimTags(str);

        if (str.length > length) {
            var substring = str.substring(0, length);
            return substring.substring(0, Math.max(substring.lastIndexOf(' '), substring.lastIndexOf(',') - 1)) + ' ...';
        } else {
            return str;
        }
    },

    /* рендеринг ejs-шаблона */
    renderEjsFile: (path, data) => {

        return new Promise((resolve, reject) => {

            ejs.renderFile(path, data, null, (err, str) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(str);
                }
            });

        });

    }
}