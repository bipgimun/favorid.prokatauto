ALTER TABLE `incomes` 
    ADD `driver_id` INT NULL DEFAULT NULL AFTER `code`, 
    ADD `supplier_id` INT NULL DEFAULT NULL AFTER `driver_id`, 
    ADD INDEX (`driver_id`), 
    ADD INDEX (`supplier_id`);
