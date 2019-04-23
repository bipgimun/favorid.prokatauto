ALTER TABLE `apartment_reservations` ADD `number_of_clients` INT(11) NOT NULL AFTER `passenger_id`;
ALTER TABLE `apartments` ADD `apartment_owned` BOOLEAN NOT NULL AFTER `utilities_per_month`;
ALTER TABLE `apartment_reservations` ADD `manager_id` INT NOT NULL AFTER `id`;
ALTER TABLE `cars_reservations` ADD `manager_id` INT NOT NULL AFTER `id`;
ALTER TABLE `apartment_reservations` DROP `cash_storage_id`;
ALTER TABLE `erp`.`apartment_reservations` DROP FOREIGN KEY `apartment_reservations_ibfk_3`;
