ALTER TABLE `salary_reports_details` ADD `shift_id` INT NULL DEFAULT NULL AFTER `reserv_id`;
ALTER TABLE `salary_reports_details` CHANGE `reserv_id` `reserv_id` INT NULL DEFAULT NULL;
