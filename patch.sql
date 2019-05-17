CREATE TABLE `detailing_cars_details` ( 
    `id` INT NOT NULL AUTO_INCREMENT , 
    `detailing_id` INT NOT NULL , 
    `reserv_id` INT NOT NULL , 
    `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
PRIMARY KEY (`id`), INDEX (`detailing_id`), INDEX (`reserv_id`)) ENGINE = InnoDB;

ALTER TABLE `detailing_cars` ADD `period_from` DATE NOT NULL AFTER `client_id`, ADD `period_end` DATE NOT NULL AFTER `period_from`;

ALTER TABLE `detailing_cars` DROP `client_id`;

ALTER TABLE `detailing_cars_details` ADD FOREIGN KEY (`detailing_id`) REFERENCES `detailing_cars`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
