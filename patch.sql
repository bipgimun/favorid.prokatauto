-- CREATE TABLE `detailing_cars_details` ( 
--     `id` INT NOT NULL AUTO_INCREMENT , 
--     `detailing_id` INT NOT NULL , 
--     `reserv_id` INT NOT NULL , 
--     `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
-- PRIMARY KEY (`id`), INDEX (`detailing_id`), INDEX (`reserv_id`)) ENGINE = InnoDB;

-- ALTER TABLE `detailing_cars` ADD `period_from` DATE NOT NULL AFTER `client_id`, ADD `period_end` DATE NOT NULL AFTER `period_from`;

-- ALTER TABLE `detailing_cars` DROP `client_id`;

-- ALTER TABLE `detailing_cars_details` ADD FOREIGN KEY (`detailing_id`) REFERENCES `detailing_cars`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;


-- ALTER TABLE `apartment_reservations` ADD `manager_id` INT NOT NULL AFTER `passenger_id`, ADD INDEX (`manager_id`);
-- ALTER TABLE `apartment_reservations` ADD `number_of_clients` INT NOT NULL AFTER `number_days`;

-- CREATE TABLE `detailing_apartments` (
--   `id` int(11) NOT NULL,
--   `number` varchar(255) DEFAULT NULL,
--   `customer_id` int(11) NOT NULL,
--   `period_from` date NOT NULL,
--   `period_end` date NOT NULL,
--   `sum` decimal(11,2) NOT NULL,
--   `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ALTER TABLE `detailing_apartments`
--   ADD PRIMARY KEY (`id`),
--   ADD KEY `customer_id` (`customer_id`);
  
--   ALTER TABLE `detailing_apartments`
--   MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- CREATE TABLE `detailing_apartments_details` (
--   `id` int(11) NOT NULL,
--   `detailing_id` int(11) NOT NULL,
--   `reserv_id` int(11) NOT NULL,
--   `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ALTER TABLE `detailing_apartments_details`
--   ADD PRIMARY KEY (`id`),
--   ADD KEY `detailing_id` (`detailing_id`),
--   ADD KEY `reserv_id` (`reserv_id`);


-- ALTER TABLE `detailing_apartments_details`
--   MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ALTER TABLE `apartments` ADD `apartment_owned` BOOLEAN NOT NULL AFTER `id`;
-- ALTER TABLE `apartment_reservations` DROP `cash_storage_id`;

-- изменить тип поля "номер" на строку для кассы/счета
-- ALTER TABLE `cash_storages` CHANGE `number` `number` VARCHAR(255) NOT NULL;

-- CREATE TABLE `invoices` (
--   `id` int(11) NOT NULL,
--   `customer_id` int(11) NOT NULL,
--   `code` varchar(255) NOT NULL,
--   `base_id` int(11) NOT NULL,
--   `sum` decimal(11,2) NOT NULL,
--   `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   `closed` timestamp NULL DEFAULT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ALTER TABLE `invoices`
--   ADD PRIMARY KEY (`id`),
--   ADD KEY `customer_id` (`customer_id`);
-- ALTER TABLE `invoices`
--   MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- добавление полей из прайслиста в таблицу автомобилей
-- ALTER TABLE `cars` ADD `price_per_day` DECIMAL(11,2) NOT NULL AFTER `class_name`, ADD `deposit` DECIMAL(11,2) NOT NULL AFTER `price_per_day`, ADD `limit_per_day` INT(11) NOT NULL AFTER `deposit`, ADD `surcharge` DECIMAL(11,2) NOT NULL AFTER `limit_per_day`;

-- очистка полей по price_id
-- ALTER TABLE `cars_reservations` DROP `price_id`;

-- добавление поля "дата завершения заявки";
-- ALTER TABLE `cars_reservations` ADD `close_at` TIMESTAMP NULL DEFAULT NULL AFTER `created_at`;

-- добавление таблицы зарплатных отчётов
-- CREATE TABLE `salary_reports` (
--   `id` int(11) NOT NULL,
--   `period_left` date NOT NULL,
--   `period_right` date NOT NULL,
--   `driver_id` int(11) DEFAULT NULL,
--   `sum` decimal(11,2) NOT NULL,
--   `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ALTER TABLE `salary_reports` ADD PRIMARY KEY(`id`);
-- ALTER TABLE `salary_reports` CHANGE `id` `id` INT(11) NOT NULL AUTO_INCREMENT;

-- добавление таблицы детализации отчёта
-- CREATE TABLE `salary_reports_details` (
--   `id` int(11) NOT NULL,
--   `report_id` int(11) NOT NULL,
--   `reserv_id` int(11) NOT NULL,
--   `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ALTER TABLE `salary_reports_details`
--   ADD PRIMARY KEY (`id`);

-- ALTER TABLE `salary_reports_details`
--   MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- таблица актов сверки
-- CREATE TABLE `act_sverki_documents` (
--   `id` int(11) NOT NULL,
--   `customer_id` int(11) NOT NULL,
--   `period_left` date NOT NULL,
--   `period_right` date NOT NULL,
--   `sum` decimal(11,2) NOT NULL,
--   `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ALTER TABLE `act_sverki_documents`
--   ADD PRIMARY KEY (`id`);

-- ALTER TABLE `act_sverki_documents`
--   MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- добавление заказчика в приходах
-- ALTER TABLE `incomes` ADD `customer_id` INT NULL DEFAULT NULL AFTER `cash_storage_id`;

-- добавление saldo в документы актов
-- ALTER TABLE `act_sverki_documents` ADD `saldo` DECIMAL(11,2) NOT NULL DEFAULT '0' AFTER `period_right`;

-- создание таблицы для детализации документа акта
-- CREATE TABLE `act_sverki_documents_details` (
--   `id` int(11) NOT NULL,
--   `title` varchar(255) NOT NULL,
--   `code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
--   `income` decimal(11,2) DEFAULT NULL,
--   `gone` decimal(11,2) DEFAULT NULL,
--   `document_id` int(11) NOT NULL,
--   `base_id` int(11) NOT NULL,
--   `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ALTER TABLE `act_sverki_documents_details`
--   ADD PRIMARY KEY (`id`),
--   ADD KEY `document_id` (`document_id`);

-- ALTER TABLE `act_sverki_documents_details`
--   MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ALTER TABLE `act_sverki_documents_details`
--   ADD CONSTRAINT `act_sverki_documents_details_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `act_sverki_documents` (`id`) ON DELETE CASCADE;

-- добавление связей
-- ALTER TABLE `detailing_apartments_details` ADD FOREIGN KEY (`detailing_id`) REFERENCES `detailing_apartments`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- ДОБАВЛЕНО В БД 12.06.19 КРУЦЕНКО

-- 6.08.19
-- пометка аккаунта директора
ALTER TABLE `employees` ADD `is_director` BOOLEAN NOT NULL DEFAULT FALSE AFTER `middle_name`;
-- добавление разделения прав
ALTER TABLE `employees` ADD `is_senior_manager` BOOLEAN NOT NULL DEFAULT FALSE AFTER `is_director`, ADD `is_manager` BOOLEAN NOT NULL DEFAULT TRUE AFTER `is_senior_manager`;

-- добавить номер телефона сотруднику
ALTER TABLE `employees` ADD `phone` VARCHAR(255) NULL DEFAULT NULL AFTER `middle_name`;

-- добавление флага уволен ли сотрудник
ALTER TABLE `employees` ADD `is_fired` BOOLEAN NOT NULL DEFAULT FALSE AFTER `phone`;

-- access_id - старое поле, которое использовалось для тату. сейчас не используется. по умолчанию всегда нулл
ALTER TABLE `employees` CHANGE `access_id` `access_id` INT(11) NULL DEFAULT NULL;

-- способ получения уведомлений для заказчика
ALTER TABLE `cars_reservations` 
    ADD `notify_sms` BOOLEAN NOT NULL DEFAULT FALSE AFTER `id`, 
    ADD `notify_email` BOOLEAN NOT NULL DEFAULT FALSE AFTER `notify_sms`;

ALTER TABLE `apartment_reservations` 
    ADD `notify_sms` BOOLEAN NOT NULL DEFAULT FALSE AFTER `id`, 
    ADD `notify_email` BOOLEAN NOT NULL DEFAULT FALSE AFTER `notify_sms`;

ALTER TABLE `customers` 
    ADD `notify_sms` BOOLEAN NOT NULL DEFAULT FALSE AFTER `id`, 
    ADD `notify_email` BOOLEAN NOT NULL DEFAULT FALSE AFTER `notify_sms`;

CREATE TABLE `sms_notifications` ( 
    `id` INT NOT NULL AUTO_INCREMENT , 
    `phone` VARCHAR(255) NOT NULL , 
    `message` TEXT NULL DEFAULT NULL,
    `customer_id` INT NOT NULL , 
    `sms_id` VARCHAR(255) NULL , 
    `status` VARCHAR(255) NOT NULL ,
    `error` TEXT NULL DEFAULT NULL,
    `cost` DECIMAL(11,2) NOT NULL ,
    `create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`), INDEX (`customer_id`)
) ENGINE = InnoDB;

-- ДОБАВЛЕНО В БД 11.08.19 КРУЦЕНКО

CREATE TABLE `balance` ( 
    `id` INT NOT NULL AUTO_INCREMENT , 
    `driver_id` INT NOT NULL , 
    `income` DECIMAL(11,2) NOT NULL , 
    `cost` DECIMAL(11,2) NOT NULL , 
    `create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
    PRIMARY KEY (`id`), INDEX (`driver_id`)
) ENGINE = InnoDB;

ALTER TABLE `employees` ADD `birthday` DATE NULL DEFAULT NULL;
-- ДОБАВЛЕНО В БД 12.08.19 КРУЦЕНКО

ALTER TABLE `costs` ADD `driver_id` INT NULL DEFAULT NULL AFTER `base_id`;
-- ДОБАВЛЕНО В БД 12.08.19 КРУЦЕНКО


CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `birthday` date DEFAULT NULL,
  `driver_license_issue_date` date DEFAULT NULL,
  `driver_license_expiration_date` date DEFAULT NULL,
  `passport_issue_date` date DEFAULT NULL,
  `passport_issued_by` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `passport_division_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `location` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `is_legal_entity` tinyint(1) NOT NULL COMMENT 'Юридическое лицо?',
  `legal_address` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `actual_address` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `ogrn` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `inn` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `r_account` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `k_account` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `bik` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `passport` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `driver_license` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact_number` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `discount` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `incomes` ADD `manager_id` INT NOT NULL AFTER `id`, ADD INDEX (`manager_id`);
ALTER TABLE `costs` ADD `manager_id` INT NOT NULL AFTER `id`, ADD INDEX (`manager_id`);
ALTER TABLE `salary_reports` ADD `manager_id` INT NOT NULL AFTER `id`, ADD INDEX (`manager_id`);
ALTER TABLE `act_sverki_documents` ADD `manager_id` INT NOT NULL AFTER `id`, ADD INDEX (`manager_id`);
ALTER TABLE `detailing_apartments` ADD `manager_id` INT NOT NULL AFTER `id`, ADD INDEX (`manager_id`);
ALTER TABLE `detailing_cars` ADD `manager_id` INT NOT NULL AFTER `id`, ADD INDEX (`manager_id`);
ALTER TABLE `invoices` ADD `manager_id` INT NOT NULL AFTER `id`, ADD INDEX (`manager_id`);
ALTER TABLE `invoices` ADD `file` VARCHAR(255) NULL DEFAULT NULL AFTER `id`;
ALTER TABLE `costs` ADD `supplier_id` INT NULL DEFAULT NULL AFTER `driver_id`, ADD INDEX (`supplier_id`);
-- ДОБАВЛЕНО В БД 12.08.19 КРУЦЕНКО
