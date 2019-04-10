ALTER TABLE `drivers` CHANGE `car_id` `car_id` INT(11) NULL DEFAULT NULL;
ALTER TABLE `drivers` CHANGE `is_individual` `is_individual` TINYINT(1) NULL DEFAULT NULL COMMENT 'Личный или закреплённый';
