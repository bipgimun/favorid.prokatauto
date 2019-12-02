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