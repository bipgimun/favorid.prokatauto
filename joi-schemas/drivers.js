const Joi = require('joi');

const schema = {
    name: Joi.string().label('ФИО водителя'),
    birthday: Joi.date().iso().label('Дата рождения'),
    contact_number: Joi.string().label('Контактный номер телефон'),
    driver_license: Joi.string().label('Водительское удостоверение'),
    license_date_issue: Joi.date().label('Дата выдачи водительского удостоверения'),
    license_date_expiration: Joi.string().label('Дата окончания водительского удостоверения'),
    passport: Joi.string().label('Серия, номер паспорта'),
    passport_date_issue: Joi.date().iso().label('Дата выдачи паспорта'),
    passport_issued_by: Joi.string().label('Кем выдан'),
    passport_division_code: Joi.string().label('Код подразделения'),
    passport_location: Joi.string().label('Место жительства'),
    is_individual: Joi.number().valid(0, 1).empty('').default(null),
    car_id: Joi.number().label('Автомобиль').when('is_individual', {
        is: null,
        then: Joi.any().empty(Joi.number()).default(null),
        otherwise: Joi.number().required()
    }),
};

exports.addSchema = Joi.object({
    name: schema.name.required(),
    birthday: schema.birthday.required(),
    contact_number: schema.contact_number.required(),
    driver_license: schema.driver_license.required(),
    license_date_issue: schema.license_date_issue.required(),
    license_date_expiration: schema.license_date_expiration.required(),
    passport: schema.passport.required(),
    passport_date_issue: schema.passport_date_issue.required(),
    passport_issued_by: schema.passport_issued_by.required(),
    passport_division_code: schema.passport_division_code.required(),
    passport_location: schema.passport_location.required(),
    is_individual: schema.is_individual,
    car_id: schema.car_id,
})

exports.updateSchema = Joi.object({
    name: schema.name,
    birthday: schema.birthday,
    contact_number: schema.contact_number,
    driver_license: schema.driver_license,
    license_date_issue: schema.license_date_issue,
    license_date_expiration: schema.license_date_expiration,
    passport: schema.passport,
    passport_date_issue: schema.passport_date_issue,
    passport_issued_by: schema.passport_issued_by,
    passport_division_code: schema.passport_division_code,
    passport_location: schema.passport_location,
    is_individual: schema.is_individual,
    car_id: schema.car_id,
})