-- заявка может быть без пассажира
ALTER TABLE `cars_reservations` CHANGE `passenger_id` `passenger_id` INT(11) NULL DEFAULT NULL;
