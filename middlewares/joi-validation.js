const Joi = require('joi');

exports.joiValidate = (schema, from = 'body') => {
    return (req, res, next) => {

        const data = req[from].values ? req[from].values : req[from];

        const { error, value } = Joi.validate(data, schema);
        const valid = error == null;

        if (valid) {
            next();
        } else {
            const { details } = error;

            const message = details.map(i => {

                const { label } = i.context;

                if (i.type === 'any.required') {
                    return `Поле ${label} является обязательным для заполнения`;
                } else if (i.type === 'any.empty') {
                    return `Поле ${label} не должно быть пустым`;
                } else if (i.type === 'date.isoDate') {
                    return `Поле ${label} имеет неверный формат даты`;
                } else if(i.type === 'boolean.base') {
                    return `Поле ${label} должно быть типа логическим выражением`;
                } else if(i.type === 'date.base') {
                    return `Поле ${label} должно быть типа датой`;
                } else if(i.type === 'number.base') {
                    return `Поле ${label} должно быть числовым типом`;
                } else if(i.type === 'string.base') {
                    return `Поле ${label} должно быть строковым типом`;
                }


                return i.message;

            }).join(',');

            res.status(200).json({ message: message })
        }
    }
} 