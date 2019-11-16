-- сумма залога в резерве на тачку
ALTER TABLE `cars_reservations` ADD `car_deposit` DECIMAL(11,2) NULL DEFAULT '0' AFTER `car_id`;

ALTER TABLE `cars_reservations` CHANGE `sum` `sum` DECIMAL(20,2) NOT NULL;

