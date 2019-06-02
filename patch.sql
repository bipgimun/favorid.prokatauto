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