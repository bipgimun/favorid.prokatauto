ALTER TABLE `apartment_reservations` ADD `paid_sum` DECIMAL(20,2) NOT NULL DEFAULT '0' AFTER `manager_id`;
ALTER TABLE `cars_reservations` ADD `car_deposit` DECIMAL(11,2) NULL DEFAULT '0';
ALTER TABLE `cars_reservations` ADD `paid_sum` DECIMAL(20,2) NOT NULL DEFAULT '0';
ALTER TABLE `cars_reservations` CHANGE `sum` `sum` DECIMAL(20,2) NOT NULL;

ALTER TABLE `cars_reservations` 
    ADD `reserv_mileage` INT(11) NULL DEFAULT NULL AFTER `car_id`, 
    ADD `reserv_fuel_level` INT(11) NULL DEFAULT NULL AFTER `reserv_mileage`;

ALTER TABLE `costs` ADD `customer_id` INT NULL DEFAULT NULL AFTER `driver_id`, ADD INDEX (`customer_id`);

CREATE TABLE `costs_details` (
  `id` int(11) NOT NULL,
  `cost_id` int(11) NOT NULL,
  `target_type` varchar(255) NOT NULL,
  `target_id` int(11) NOT NULL,
  `price` decimal(20,2) NOT NULL DEFAULT '0.00',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `costs_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cost_id` (`cost_id`),
  ADD KEY `target_type` (`target_type`),
  ADD KEY `target_id` (`target_id`);

ALTER TABLE `costs_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `drivers2shifts` CHANGE `hours` `hours` DECIMAL(11,2) NOT NULL DEFAULT '0';

ALTER TABLE `incomes` 
    ADD `driver_id` INT NULL DEFAULT NULL AFTER `code`, 
    ADD `supplier_id` INT NULL DEFAULT NULL AFTER `driver_id`, 
    ADD INDEX (`driver_id`), 
    ADD INDEX (`supplier_id`);

ALTER TABLE `muz_contracts` 
    CHANGE `id` `id` INT(11) NOT NULL AUTO_INCREMENT, 
    CHANGE `gorod_hours` `gorod_hours` DECIMAL(11,2) NULL DEFAULT NULL, 
    CHANGE `gorod_ostatki_hours` `gorod_ostatki_hours` DECIMAL(11,2) NULL DEFAULT NULL, 
    CHANGE `komandirovki_hours` `komandirovki_hours` DECIMAL(11,2) NULL DEFAULT NULL, 
    CHANGE `gruzovie_hours` `gruzovie_hours` DECIMAL(11,2) NULL DEFAULT NULL, 
    CHANGE `pitanie_hours` `pitanie_hours` DECIMAL(11,2) NULL DEFAULT NULL, 
    CHANGE `avtobus_hours` `avtobus_hours` DECIMAL(11,2) NULL DEFAULT NULL, 
    CHANGE `vnedorozhnik_hours` `vnedorozhnik_hours` DECIMAL(11,2) NULL DEFAULT NULL, 
    CHANGE `pomosh_hours` `pomosh_hours` DECIMAL(11,2) NULL DEFAULT NULL, 
    CHANGE `other_hours` `other_hours` DECIMAL(11,2) NULL DEFAULT NULL, 
    CHANGE `total_hours` `total_hours` DECIMAL(11,2) NOT NULL;

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `target_type` varchar(255) NOT NULL,
  `target_id` int(11) NOT NULL,
  `target_date` date NOT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `manager_id` (`manager_id`);

ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `suppliers_deals` ADD `incoming_document_number` VARCHAR(255) NULL DEFAULT NULL AFTER `position_id`;