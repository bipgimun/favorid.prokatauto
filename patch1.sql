ALTER TABLE `cars_reservations` ADD `reserv_mileage` INT(11) NULL DEFAULT NULL AFTER `car_id`, ADD `reserv_fuel_level` INT(11) NULL DEFAULT NULL AFTER `reserv_mileage`;
