ALTER TABLE `cars_reservations` ADD `driver_salary` DECIMAL(11,2) NOT NULL DEFAULT '0' AFTER `driver_id`;
ALTER TABLE `cars_reservations` ADD `has_driver` BOOLEAN NOT NULL DEFAULT FALSE AFTER `driver_id`;
