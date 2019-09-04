ALTER TABLE `cars_reservations` ADD `itinerarie_point_a` VARCHAR(255) NULL DEFAULT NULL AFTER `itinerarie_id`, ADD `itinerarie_point_b` VARCHAR(255) NULL DEFAULT NULL AFTER `itinerarie_point_a`;
