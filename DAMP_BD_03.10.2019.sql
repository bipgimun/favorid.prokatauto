-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Окт 02 2019 г., 23:35
-- Версия сервера: 8.0.15
-- Версия PHP: 7.1.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `erp`
--

-- --------------------------------------------------------

--
-- Структура таблицы `act_sverki_documents`
--

CREATE TABLE `act_sverki_documents` (
  `id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `period_left` date NOT NULL,
  `period_right` date NOT NULL,
  `saldo` decimal(11,2) NOT NULL DEFAULT '0.00',
  `sum` decimal(11,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `act_sverki_documents_details`
--

CREATE TABLE `act_sverki_documents_details` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `income` decimal(11,2) DEFAULT NULL,
  `gone` decimal(11,2) DEFAULT NULL,
  `document_id` int(11) NOT NULL,
  `base_id` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `act_sverki_suppliers_documents`
--

CREATE TABLE `act_sverki_suppliers_documents` (
  `id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `period_left` date NOT NULL,
  `period_right` date NOT NULL,
  `saldo` decimal(11,2) NOT NULL DEFAULT '0.00',
  `sum` decimal(11,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `act_sverki_suppliers_documents_details`
--

CREATE TABLE `act_sverki_suppliers_documents_details` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `income` decimal(11,2) DEFAULT NULL,
  `gone` decimal(11,2) DEFAULT NULL,
  `document_id` int(11) NOT NULL,
  `base_id` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `act_works`
--

CREATE TABLE `act_works` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `document_id` int(11) NOT NULL,
  `file` varchar(512) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `additional_services`
--

CREATE TABLE `additional_services` (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `price` decimal(11,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `additional_services`
--

INSERT INTO `additional_services` (`id`, `name`, `price`) VALUES
(1, 'Трансфер Магнитогорск - Екатеринбург', '9000.00'),
(2, 'Трансфер Магнитогорск - Челябинск', '5500.00');

-- --------------------------------------------------------

--
-- Структура таблицы `apartments`
--

CREATE TABLE `apartments` (
  `id` int(11) NOT NULL,
  `apartment_owned` tinyint(1) NOT NULL,
  `address` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `rooms` int(11) NOT NULL,
  `price_per_day` decimal(11,2) NOT NULL,
  `utilities_per_month` decimal(11,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `apartments`
--

INSERT INTO `apartments` (`id`, `apartment_owned`, `address`, `rooms`, `price_per_day`, `utilities_per_month`) VALUES
(1, 1, 'asdasd', 3, '224.00', '1500.00');

-- --------------------------------------------------------

--
-- Структура таблицы `apartment_reservations`
--

CREATE TABLE `apartment_reservations` (
  `id` int(11) NOT NULL,
  `apartment_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `passenger_id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `prepayment` decimal(11,2) NOT NULL,
  `services` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `number_days` int(11) NOT NULL,
  `number_of_clients` int(11) NOT NULL,
  `price_per_day` decimal(11,2) NOT NULL,
  `contact_number` varchar(75) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `discount` int(11) NOT NULL DEFAULT '0' COMMENT 'Размер скидки',
  `comment` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `sum` decimal(11,2) NOT NULL,
  `entry` datetime NOT NULL,
  `departure` datetime NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `balance`
--

CREATE TABLE `balance` (
  `id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `income` decimal(11,2) NOT NULL,
  `cost` decimal(11,2) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `model` varchar(75) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `class_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `price_per_day` decimal(11,2) NOT NULL,
  `deposit` decimal(11,2) NOT NULL,
  `limit_per_day` int(11) NOT NULL,
  `surcharge` decimal(11,2) NOT NULL,
  `number` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `mileage` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `company_property` tinyint(1) NOT NULL DEFAULT '0',
  `carcass_condition` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `release_date` date DEFAULT NULL,
  `fuel_level` int(11) NOT NULL,
  `osago_number` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `osago_expiration_date` date NOT NULL,
  `maintenance` decimal(11,2) NOT NULL,
  `market_price` decimal(11,2) NOT NULL,
  `purchase_price` decimal(11,2) NOT NULL,
  `in_leasing` tinyint(1) NOT NULL DEFAULT '0',
  `payment_amount` decimal(11,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `leasing_expiration_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `cars`
--

INSERT INTO `cars` (`id`, `name`, `model`, `class_name`, `price_per_day`, `deposit`, `limit_per_day`, `surcharge`, `number`, `mileage`, `company_property`, `carcass_condition`, `release_date`, `fuel_level`, `osago_number`, `osago_expiration_date`, `maintenance`, `market_price`, `purchase_price`, `in_leasing`, `payment_amount`, `payment_date`, `leasing_expiration_date`) VALUES
(1, 'BMW 520D XDRIVE', 'BMW 520D XDRIVE', 'Бизнес +', '10500.00', '100000.00', 300, '10.00', 'о329уа174', '12607', 1, 'Отлично', '2018-12-12', 35, 'МММ5015823764', '2020-01-30', '10000.00', '2300000.00', '3000000.00', 1, '54610.00', '2019-09-25', '2021-01-25'),
(3, 'Genesis', 'G80', 'Представительский', '10500.00', '100000.00', 300, '10.00', 'о329уа174', '57012', 1, 'Отлично', '2016-12-12', 30, 'ККК3000701537', '2019-12-31', '10000.00', '1700000.00', '2400000.00', 1, '54620.00', '2019-09-25', '2020-01-30'),
(4, 'Hyundai', 'Solaris', 'Комфорт', '2400.00', '1000.00', 300, '6.00', 'к118хв174', '80020', 1, 'Отлично', '2016-12-12', 40, 'ККК3005408158', '2020-06-27', '10000.00', '400000.00', '691544.00', 1, '15770.00', '2019-08-27', '2020-06-29'),
(5, 'Nissan', 'Almera', 'Комфорт', '2400.00', '1000.00', 300, '6.00', 'х878се174', '153083', 1, 'Отлично', '2015-12-12', 40, 'ККК3005408159', '2020-06-30', '10000.00', '400000.00', '521677.00', 0, NULL, NULL, NULL),
(6, 'Toyota ', 'Camry', 'Бизнес', '4500.00', '10000.00', 300, '10.00', 'о071оа174', '107616', 1, 'Отлично', '2016-12-12', 70, 'ККК3000701536', '2020-01-11', '10000.00', '1400000.00', '1958774.00', 0, NULL, NULL, NULL),
(7, 'Toyota ', 'Camry', 'Бизнес', '5500.00', '20000.00', 300, '10.00', 'о384уа174', '17033', 1, 'Отлично', '2018-12-12', 50, 'МММ5018015407', '2020-01-26', '10000.00', '1600000.00', '1916408.00', 1, '53233.00', '2019-09-23', '2022-01-24'),
(8, 'Lada', 'Granta', 'Эконом', '1500.00', '1000.00', 400, '4.00', 'е203хо174', '59705', 1, 'Отлично', '2018-12-12', 15, 'ККК3005157569', '2020-05-05', '10000.00', '300000.00', '457000.00', 1, '8809.00', '2019-09-07', '2021-05-07'),
(9, 'Ford  Кирдиянов', 'Focus', 'Комфорт', '0.00', '0.00', 0, '0.00', 'в065хк174', '0', 0, 'Отлично', '2011-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(10, 'Hyundai Solaris Букат Черн', 'Solaris', 'Комфорт', '0.00', '0.00', 0, '0.00', 'е940хв174', '0', 0, '0', '2017-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(11, 'Volkswagen Цибарман', 'Polo', 'Комфорт', '0.00', '0.00', 0, '0.00', 'У 258 Т Р 17', '0', 0, '0', '2016-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(12, 'Volkswagen Онищенко', 'Polo', 'Комфорт', '0.00', '0.00', 0, '0.00', 'е774хв174', '0', 0, '0', '2017-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(13, 'Nissan Маргацкий', 'Almera', 'Комфорт', '0.00', '0.00', 0, '0.00', 'т966хт174', '0', 0, 'Отлично', '2017-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(14, 'Nissan Миронов', 'Almera', 'Комфорт', '0.00', '0.00', 0, '0.00', 'с875хе174', '0', 0, 'Отлично', '2017-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(15, 'Suzuki Моисеев', 'SX4', 'Комфорт', '0.00', '0.00', 0, '0.00', 'т289ср174', '0', 0, '0', '2017-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(16, 'Skoda Тугульбаев', 'Octavia', 'Комфорт', '0.00', '0.00', 0, '0.00', 'м420ов174', '0', 0, '0', '2018-12-12', 0, '0', '1901-01-01', '0.00', '-10.00', '0.00', 0, NULL, NULL, NULL),
(17, 'Volkswagen Лисин', 'Polo', 'Комфорт', '0.00', '0.00', 0, '0.00', 'е759ха174', '0', 0, '0', '2018-12-12', 0, '0', '1901-01-01', '0.00', '-10.00', '0.00', 0, NULL, NULL, NULL),
(18, 'Kia Стаценко', 'Cerato', 'Комфорт', '0.00', '0.00', 0, '0.00', 'е685на174', '0', 0, '0', '2016-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(19, 'Hyundai Ягольников', 'ix35', 'Комфорт', '0.00', '0.00', 0, '0.00', 'т750та174', '0', 0, '0', '2018-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(20, 'Honda Баландина', 'Civic', 'Комфорт', '0.00', '0.00', 0, '0.00', 'с920уе174', '0', 0, '0', '2018-12-12', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(21, 'Fiat ', 'Ducato', 'Минивэн 8 чел', '0.00', '0.00', 0, '0.00', 'р268нм174', '0', 0, '0', '2015-01-01', 0, '0', '0001-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(22, 'Fiat ', 'Ducato', 'Минивэн 8 чел', '0.00', '0.00', 0, '0.00', 'у883хх174', '0', 0, '0', '2015-01-01', 0, '0', '0001-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(23, 'Hyundai Starex', 'Starex', 'Минивэн 8 чел', '0.00', '0.00', 0, '0.00', 'р229ра174', '0', 0, '0', '2015-01-01', 0, '0', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL),
(24, 'Hyundai Тырин', 'Solaris', 'Комфорт', '0.00', '0.00', 0, '0.00', 'м303ха174', '0', 0, '0', '2018-12-12', 0, '000000', '1901-01-01', '0.00', '0.00', '0.00', 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `cars_reservations`
--

CREATE TABLE `cars_reservations` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `passenger_id` int(11) NOT NULL,
  `rent_start` datetime NOT NULL,
  `rent_finished` datetime NOT NULL,
  `manager_id` int(11) NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `car_id` int(11) NOT NULL,
  `class_name` varchar(255) NOT NULL,
  `has_driver` tinyint(1) NOT NULL DEFAULT '0',
  `itinerarie_id` int(11) DEFAULT NULL,
  `itinerarie_point_a` varchar(255) DEFAULT NULL,
  `itinerarie_point_b` varchar(255) DEFAULT NULL,
  `driver_salary` decimal(11,2) DEFAULT NULL,
  `services` varchar(255) DEFAULT NULL,
  `prepayment` decimal(11,2) NOT NULL,
  `discount` decimal(11,2) DEFAULT NULL,
  `comment` text,
  `sum` decimal(11,2) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `close_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `cars_reservations`
--

INSERT INTO `cars_reservations` (`id`, `customer_id`, `contact_number`, `passenger_id`, `rent_start`, `rent_finished`, `manager_id`, `driver_id`, `car_id`, `class_name`, `has_driver`, `itinerarie_id`, `itinerarie_point_a`, `itinerarie_point_b`, `driver_salary`, `services`, `prepayment`, `discount`, `comment`, `sum`, `status`, `close_at`) VALUES
(1, 3, '+7(925) 244-24-24', 1, '2019-09-02 11:00:00', '2019-09-02 11:30:00', 8, 5, 17, 'Комфорт', 1, 2, 'Аэропорт Магнитогорск', 'Ленина 130 БЦ Форум', '350.00', NULL, '600.00', '0.00', '', '600.00', 2, '2019-09-04 07:46:21'),
(2, 25, '+7(111) 111-11-11', 2, '2019-09-01 10:00:00', '2019-09-01 16:00:00', 8, 2, 16, 'Комфорт', 1, 3, ' Магнитогорск', 'Екатеринбург', '6500.00', NULL, '9000.00', '0.00', NULL, '9000.00', 2, '2019-09-04 07:48:24'),
(3, 3, '+7(000) 000-00-00', 3, '2019-09-01 20:45:00', '2019-09-01 21:30:00', 8, 4, 21, 'Минивэн 8 чел', 1, 2, 'Аэропорт Магнитогорск', 'Ленина 130 БЦ Форум', '1300.00', NULL, '1800.00', '0.00', '', '1800.00', 2, '2019-09-04 07:49:07'),
(4, 3, '+7(000) 000-00-00', 3, '2019-09-01 21:00:00', '2019-09-01 21:30:00', 8, 14, 22, 'Минивэн 8 чел', 1, 7, 'Аэропорт Магнитогорск', 'Арена Металлург', '1300.00', NULL, '1800.00', '0.00', '', '1800.00', 2, '2019-09-04 07:45:29'),
(5, 28, '+7(919) 110-07-73', 1, '2019-09-05 10:30:00', '2019-09-05 16:59:00', 7, 11, 7, 'Бизнес', 1, 8, 'КМ 231/3, 1п', 'Город', '600.00', '1', '5400.00', '0.00', 'Выезд на Банное  1000 руб. включен  в стоимость', '5400.00', 0, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `cash_storages`
--

CREATE TABLE `cash_storages` (
  `id` int(11) NOT NULL,
  `cashbox` tinyint(1) NOT NULL COMMENT 'Касса или счёт',
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `number` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `cash_storages`
--

INSERT INTO `cash_storages` (`id`, `cashbox`, `name`, `number`) VALUES
(1, 1, 'Наличные оф.219', '1'),
(2, 1, 'Карта сбербанк (Головина Р.В.)', '1'),
(4, 0, 'ТОЧКА БАНК', '1'),
(5, 0, 'Челябинвест Банк', '2'),
(6, 0, 'Челиндбанк (ЧИБ)', '3'),
(7, 0, 'Тинькофф Банк Бизнес', '4'),
(8, 0, 'Сбербанк', '5'),
(9, 0, 'Сбербанк (СПЕЦ Счет)', '6');

-- --------------------------------------------------------

--
-- Структура таблицы `coming_goods`
--

CREATE TABLE `coming_goods` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `good_id` int(11) NOT NULL,
  `count` int(11) NOT NULL,
  `price` decimal(11,2) NOT NULL,
  `sum` decimal(11,2) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `costs`
--

CREATE TABLE `costs` (
  `id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `code` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `base_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `document_id` int(11) DEFAULT NULL,
  `base_other` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `cash_storage_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `comment` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `sum` decimal(11,2) NOT NULL,
  `date` date NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `costs_categories`
--

CREATE TABLE `costs_categories` (
  `id` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `costs_categories`
--

INSERT INTO `costs_categories` (`id`, `title`) VALUES
(1, 'asdasdasd');

-- --------------------------------------------------------

--
-- Структура таблицы `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `birthday` date DEFAULT NULL,
  `driver_license_issue_date` date DEFAULT NULL,
  `driver_license_expiration_date` date DEFAULT NULL,
  `passport_issue_date` date DEFAULT NULL,
  `passport_issued_by` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `passport_division_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `location` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `is_legal_entity` tinyint(1) NOT NULL COMMENT 'Юридическое лицо?',
  `legal_address` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `actual_address` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `ogrn` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `inn` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `r_account` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `k_account` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `bik` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `passport` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `driver_license` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact_number` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `discount` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `customers`
--

INSERT INTO `customers` (`id`, `birthday`, `driver_license_issue_date`, `driver_license_expiration_date`, `passport_issue_date`, `passport_issued_by`, `passport_division_code`, `location`, `is_legal_entity`, `legal_address`, `actual_address`, `email`, `ogrn`, `inn`, `bank_name`, `r_account`, `k_account`, `bik`, `name`, `passport`, `driver_license`, `contact_number`, `discount`) VALUES
(1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '115035, г. Москва, Овчинниковская набережная д.20 стр.2', '115035, г. Москва, Овчинниковская набережная д.20 стр.2', 'victoria.pronina@omya.com', '1027807980650', '7816108883', 'АО \"РАЙФФАЙЗЕНБАНК\" Г. МОСКВА', '40702810300000000000', '30101810200000000000', '44525700', 'АО \"Омиа Урал\"', NULL, NULL, NULL, 50),
(2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '115035, г. Москва, Овчинниковская набережная д.20 стр.2', '115035, г. Москва, Овчинниковская набережная д.20 стр.2', 'victoria.pronina@omya.com', '1027807980650', '7816108883', 'АО \"РАЙФФАЙЗЕНБАНК\" Г. МОСКВА', '40702810300000001818', '30101810200000000700', '044525700', 'АО \"ОМИА АЛГОЛ РУС\"', NULL, NULL, NULL, 0),
(3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '455000, город Магнитогорск, ул. Дунайская, д.33, кв.2', 'город Магнитогорск, ул.Ленина 130', 'admin@bc-forum.ru', '306744408300092', '744403470836', 'ПАО АКБ \"АВАНГАРД\" Г. МОСКВА', '40802810538100013784', '30101810000000000201', '044525201', 'ИП Немчинова С.Б.', NULL, NULL, NULL, 0),
(4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '630048, Новосибирская область, город Новосибирск, улица Немировича-Данченко, дом 139, этаж 1', '630048, Новосибирская область, город Новосибирск, улица Немировича-Данченко, дом 139, этаж 1', 'korp@vgtransfer.com', '1125476161546', '5404470392', 'ФИЛИАЛ № 5440 БАНКА ВТБ (ПАО) Г. НОВОСИБИРСК', '40702810406400009387', '30101810450040000751', '045004751', 'ООО \"ВиДжиТи\"', NULL, NULL, NULL, 0),
(5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '630007, Российская Федерация, Новосибирская область, г. Новосибирск, улица Коммунистическая, д. 6, оф. 707', '630007, Российская Федерация, Новосибирская область, г. Новосибирск, улица Коммунистическая, д. 6, оф. 707', 'booking@iwayex.com', '1135476009261', '5407482780', 'БАНК \"ЛЕВОБЕРЕЖНЫЙ\" (ОАО) Г. НОВОСИБИРСК', '40702810001000002965', '30101810100000000850', '045004850', 'ООО \"АйВэй\"', NULL, NULL, NULL, 0),
(6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '630001, Российская Федерация, Новосибирская область, г. Новосибирск, улица Сухарная, дом 35, корпус 13, офис 333', '630001, Российская Федерация, Новосибирская область, г. Новосибирск, улица Сухарная, дом 35, корпус 13, офис 333', 'booking@iwayex.com', '1125476062227', '5402549791', 'БАНК \"ЛЕВОБЕРЕЖНЫЙ\" (ОАО) Г. НОВОСИБИРСК', '40702810801000003203', '30101810100000000850', '045004850', 'ООО \"АйВэй Карс\"', NULL, NULL, NULL, 0),
(7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '630007, г. Новосибирск, ул. Коммунистическая, д. 6, оф. 707', '630007, г. Новосибирск, ул. Коммунистическая, д. 6, оф. 707', 'booking@iwayex.com', '1125476158719', '5407479940', 'НОВОСИБИРСКИЙ ФИЛИАЛ ОАО \"БАНК МОСКВЫ\" Г. НОВОСИБИРСК', '40702810500430011852', '30101810900000000762', '045004762', 'ООО \"АйВэй Трансфер\"', NULL, NULL, NULL, 0),
(8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '630001, Российская Федерация, Новосибирская область, г. Новосибирск, улица Сухарная, д.35, корп.13, оф.337', '630001, Российская Федерация, Новосибирская область, г. Новосибирск, улица Сухарная, д.35, корп.13, оф.337', 'booking@iwayex.com', '1105476090400', '5402532445', 'БАНК \"ЛЕВОБЕРЕЖНЫЙ\" (ОАО) Г. НОВОСИБИРСК', '40702810301000002869', '30101810100000000850', '045004850', 'ООО \"АйВэй Экспресс\"', NULL, NULL, NULL, 0),
(9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '196247, Санкт-Петербург г, Ленинский пр., дом № 153, корпус А, оф.706', '196247, Санкт-Петербург г, Ленинский пр., дом № 153, корпус А, оф.706', 'booking@a2b.ru', '1137847376413', '7841489382', 'ФИЛИАЛ \"САНКТ-ПЕТЕРБУРГСКИЙ\" АО \"АЛЬФА-БАНК\" Г. САНКТ-ПЕТЕРБУРГ', '40702810032320000081', '30101810600000000786', '044030786', 'ООО \"А2Б.РУ\"', NULL, NULL, NULL, 0),
(10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '650002,Россия, г.Кемерово,ул. Институтская, дом 1, офис 130', '650002,Россия, г.Кемерово,ул. Институтская, дом 1, офис 130', 'info@albatroc.com', '1164205056278', '4205324613', 'ФИЛИАЛ \"СИБИРСКИЙ\" БАНКА ВТБ (ПАО) Г. НОВОСИБИРСК', '40702810100430118922', '30101810850040000788', '045004788', 'ООО \"Альбатрос-Бизнес Кар Трансфер\"', NULL, NULL, '+7(800) 250-17-17', 0),
(11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '656067, Алтайский край, г. Барнаул, ул. Взлетная, д. 65, помещение В.', '656067, Алтайский край, г. Барнаул, ул. Взлетная, д. 65, помещение В.', 'driver@buytheway.org', '1132225013700', '2221207078', 'ФИЛИАЛ \"НОВОСИБИРСКИЙ\" АО \"АЛЬФА-БАНК\" Г. НОВОСИБИРСК', '40702810723160000887', '30101810600000000774', '045004774', 'ООО \"Байвэй\"', NULL, NULL, '+7(800) 301-88-17', 0),
(12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '191028, г. Санкт-Петербург, Литейный пр., д.26, литер А, пом. 475, офис 522', '191028, г. Санкт-Петербург, Литейный пр., д.26, литер А, пом. 475, офис 522', 'daria.plotnikova@sevenrefractories.com', '1107847338807', '7840439815', 'ПЕТЕРБУРГСКИЙ ФИЛИАЛ АО ЮНИКРЕДИТ БАНКА г. Санкт-Петербург', '40702810300024602488', '30101810800000000858', '044030858', 'ООО \"Севен Рефракториз\"', NULL, NULL, '+7(812) 616-13-73', 0),
(13, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '455049, Челябинская область, г. Магнитогорск, ул. Завенягина, дом 9, помещение 3, офис 4', '455049, Челябинская область, г. Магнитогорск, ул. Завенягина, дом 9, помещение 3, офис 4', 'm.dadaeva@firstmib.com', '1157456004683', '7456027298', 'ЧФ АО \"СМП БАНК\" Г. ЧЕЛЯБИНСК', '40702810804100003740', '30101810000000000988', '047501988', 'ООО \"Центр коммунального сервиса\"', NULL, NULL, '+7(977) 289-89-65', 0),
(14, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '127015 г. Москва, ул. Новодмитровская Б. 23, стр. 3, антресоль 5, помещение Iа, комната 8 (офис 620', '127015 г. Москва, ул. Новодмитровская Б. 23, стр. 3, антресоль 5, помещение Iа, комната 8 (офис 620', 'm.dadaeva@firstmib.com', '5157746134530', '9715232246', 'АО \"АЛЬФА-БАНК\" г. Москва', '40702810002260000720', '30101810200000000593', '044525593', 'ООО \"ФМ Капитал\"', NULL, NULL, '+7(977) 289-89-65', 0),
(15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '354000, Россия, Краснодарский край, г. Сочи улица Островского 23, этаж 6, офис 8', '354000, Россия, Краснодарский край, г. Сочи улица Островского 23, этаж 6, офис 8', '24@e-trans.me', '1192375006515', '2367007357', 'МОСКОВСКИЙ ФИЛИАЛ АО КБ \"МОДУЛЬБАНК\" г. Москва', '40702810570010125521', '30101810645250000092', '044525092', 'ООО \"РусТрансфер\"', NULL, NULL, '+7(800) 200-33-38', 0),
(16, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '195257, Санкт-Петербург г, Науки пр-кт, дом № 12, корпус 5 Литера А, помещение 1-Н Офис 220', '195257, Санкт-Петербург г, Науки пр-кт, дом № 12, корпус 5 Литера А, помещение 1-Н Офис 220', 'info@arasar.info', '1167847087539', '7804558359', 'Ст - Петербургский ф-л ПАО \"Промсвязьбанк\" г.Санкт-Петербург', '40702810706000052012', '30101810000000000920', '044030920', 'ООО \"Демолишн\"', NULL, NULL, '+7(812) 320-28-82', 0),
(17, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '454108, Россия, Челябинская область, г.Челябинск, ул.Ш.Руставели, дом 26, кв.162', '454108, Россия, Челябинская область, г.Челябинск, ул.Ш.Руставели, дом 26, кв.162', 'semeina@mail.ru', '311743816700022', '742800561187', 'ПАО \"ЧЕЛЯБИНВЕСТБАНК\" Г. ЧЕЛЯБИНСК', '40802810290000006227', '30101810400000000779', '047501779', 'ИП Егармин Виталий Валерьевич', NULL, NULL, '+7(922) 700-70-79', 0),
(18, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '162602, РФ, Вологодская область, г. Череповец, пр-т Московский, д. 51А, оф.411', '162602, РФ, Вологодская область, г. Череповец, пр-т Московский, д. 51А, оф.411', 'p.naumov@q.center', '1103528000619', '3528162862', 'ФИЛИАЛ № 7806 БАНКА ВТБ (ПАО) Г. САНКТ-ПЕТЕРБУРГ', '40702810581600001036', '30101810240300000707', '044030707', 'ООО \"Кью-центр\"', NULL, NULL, NULL, 0),
(19, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '195220, г. Санкт-Петербург, Гражданский пр.. Д.15., корпус 1, лит А, помещение 2Н', '195220, г. Санкт-Петербург, Гражданский пр.. Д.15., корпус 1, лит А, помещение 2Н', 'mpodlipyan@mgn.etm.ru', '0', '7804526950', 'ПАО \"БАНК \"САНКТ-ПЕТЕРБУРГ\" г. Санкт-Петербург', '40702810190330002617', '30101810900000000790', '044030790', 'ООО \"ТД \"Электротехмонтаж\"', NULL, NULL, '+7(351) 928-84-85', 0),
(20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'РФ 625048, г.Тюмень Ул. Салтыкова-Щедрина, 55, кв.105 РФ 625048, г.Тюмень Ул. Республики, 141, офис 300', 'РФ 625048, г.Тюмень Ул. Салтыкова-Щедрина, 55, кв.105 РФ 625048, г.Тюмень Ул. Республики, 141, офис 300', 'request@equilibrium-concierge.ru', '1127232041045', '7203279865', 'ФИЛИАЛ \"ЕКАТЕРИНБУРГСКИЙ\" АО \"АЛЬФА-БАНК\" г. Екатеринбург', '40702810238320000258', '30101810100000000964', '046577964', 'ООО \"Эквилибриум\"', NULL, NULL, '+7(908) 874-88-80', 0),
(21, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Россия, 455038, Челябинская область, г. Магнитогорск, ул. Завенягина, дом 10 корп. А, пом.11', 'Россия, 455038, Челябинская область, г. Магнитогорск, ул. Завенягина, дом 10 корп. А, пом.11', 'e.sokolikova@ukfaeton.ru', '1057420018402', '7444045493', 'ПАО \"ЧЕЛИНДБАНК\" Г. ЧЕЛЯБИНСК', '40702810807460009852', '30101810400000000711', '047501711', 'ООО \"Экспертиза\"', NULL, NULL, '+7(909) 095-20-00', 0),
(22, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '127015, Москва г, ул.Новодмитровская Б., д.23, стр.3ПОМ.1А, ком.26', '127015, Москва г, ул.Новодмитровская Б., д.23, стр.3ПОМ.1А, ком.26', 'm.dadaeva@firstmib.com', '5167746403127', '9715285449', 'АО \"АЛЬФА-БАНК\" Г. Москва', '40702810102590001700', '30101810200000000593', '044525593', 'ООО \"Финансово-Промышленные Консультанты\"', NULL, NULL, '+7(977) 289-89-65', 0),
(23, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '630007, Российская Федерация, Новосибирская область, г. Новосибирск, улица Коммунистическая, д.6, оф.704', '630007, Российская Федерация, Новосибирская область, г. Новосибирск, улица Коммунистическая, д.6, оф.704', '-', '1135476131317', '5407489070', 'БАНК \"ЛЕВОБЕРЕЖНЫЙ\" (ОАО) Г. НОВОСИБИРСК', '40702810101000003165', '30101810100000000850', '045004850', 'ООО \"Транспортные Технологии\"', NULL, NULL, NULL, 0),
(24, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '115184, г.Москва, ул. Новокузнецкая, д.1, стр.3, офис №34 E', '115184, г.Москва, ул. Новокузнецкая, д.1, стр.3, офис №34 E', 'daria.feoktistova@s-event.ru', '1167746792355', '7734389506', 'ФИЛИАЛ № 7701 БАНКА ВТБ (ПАО) г. Москва', '40702810217250000038', '30101810345250000745', '044525745', 'ООО \"Скетч\"', NULL, NULL, '+7(977) 307-94-63', 0),
(25, '0001-01-01', '0001-01-01', '0001-01-01', '0001-01-01', '0', '000-000', '0', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Китайцы', '00-00-000000', '00-00-000000', '+7(000) 000-00-00,+7(000) 000-00-00', 0),
(26, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'г.Магнитогорск Ленина 85 офис 2019', 'г.Магнитогорск Ленина 85 офис 2019', 'avtoprokat74@mail.ru,avtoprokat74@mail.ru', '0', '744511972706', 'Точка Банк', '40802810605500003872', '30101810845250000999', '044525999', 'favorit', NULL, NULL, '+7(912) 800-77-78,+7(351) 906-07-60', 0),
(27, '1987-05-27', '2017-10-10', '2027-10-10', '2007-07-03', 'Отделом УФМС по Свердловской области', '740-055', 'г. Первоуральск, пр-кт Ильича д. 18 корп. А кв.10', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Куклин Дмитрий Александроч', '65-07-161444', '6633998868', '+7(922) 185-32-21', 0),
(28, '0001-01-01', '0001-01-01', '0001-01-01', '0001-01-01', '0', '000-000', '00000', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Маркин Алексей Васильевич', '00-00-000___', '0000000000', '+7(919) 110-07-73,+7(890) 909-44-52', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `detailing_apartments`
--

CREATE TABLE `detailing_apartments` (
  `id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `number` varchar(255) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `period_from` date NOT NULL,
  `period_end` date NOT NULL,
  `sum` decimal(11,2) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `detailing_apartments_details`
--

CREATE TABLE `detailing_apartments_details` (
  `id` int(11) NOT NULL,
  `detailing_id` int(11) NOT NULL,
  `reserv_id` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `detailing_cars`
--

CREATE TABLE `detailing_cars` (
  `id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `number` varchar(255) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `period_from` date NOT NULL,
  `period_end` date NOT NULL,
  `sum` decimal(11,2) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Структура таблицы `detailing_cars_details`
--

CREATE TABLE `detailing_cars_details` (
  `id` int(11) NOT NULL,
  `detailing_id` int(11) NOT NULL,
  `reserv_id` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `drivers`
--

CREATE TABLE `drivers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `birthday` date DEFAULT NULL,
  `contact_number` varchar(50) NOT NULL,
  `car_id` int(11) DEFAULT NULL,
  `driver_license` varchar(50) NOT NULL,
  `license_date_issue` date NOT NULL COMMENT 'Дата выдачи прав',
  `license_date_expiration` date NOT NULL COMMENT 'Дата окончания прав',
  `passport` varchar(255) NOT NULL,
  `passport_date_issue` date NOT NULL COMMENT 'дата выдачи паспорта',
  `passport_issued_by` text NOT NULL COMMENT 'Кем выдан',
  `passport_division_code` varchar(55) NOT NULL,
  `passport_location` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `is_individual` tinyint(1) DEFAULT NULL COMMENT 'Личный или закреплённый',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

--
-- Дамп данных таблицы `drivers`
--

INSERT INTO `drivers` (`id`, `name`, `birthday`, `contact_number`, `car_id`, `driver_license`, `license_date_issue`, `license_date_expiration`, `passport`, `passport_date_issue`, `passport_issued_by`, `passport_division_code`, `passport_location`, `is_individual`) VALUES
(1, 'Букатников Алексей Александрович', '1979-10-19', '+7(922) 756-33-02', 10, '74-20-043932', '2015-02-19', '2025-02-19', '75-08-466703', '2009-03-25', 'Отд.№2 УФМС России по Челябинской обл. в Правобережном р-не г.Магнитогорска', '740-028', 'г. Магнитогорск ул. Грязнова д. 20 кв.43', NULL),
(2, 'Тугульбаев Николай Игоревич', '1985-10-04', '+7(900) 077-47-22', 16, '74-00-049343', '2009-02-20', '2019-02-20', '75-07-055770', '2007-08-13', 'Отд.№3 УФМС России по Челябинской области в Ленинском р-не г.Магнитогорска', '740-029', 'г. Магнитогорск ул. 50 Лет -Магнитки д. 35/1 кв94', 1),
(3, 'Алянчиков Иван Александрович', '1978-10-16', '+7(900) 077-47-22', NULL, '74-33-178917', '2017-08-08', '2027-08-08', '75-03-168675', '3003-02-04', 'ОВД Ленинского р-на г.Магнитогорска Челябинской области', '742-022', 'г. Магнитогорск ул. Боткина д.25', NULL),
(4, 'Щанкин Евгений Геннадьевич', '1972-09-15', '+7(912) 893-50-13', 22, '74-00-150518', '2008-02-06', '2018-02-06', '75-18-008125', '2017-09-25', 'Отделом УФМС России по Челябинской области в Орджоникидзевском районе г.Магнитогорска', '740-089', 'г. Магнитогорск ул. 50 лет Магнитки д. 40 кв. 161', 1),
(5, 'Лисин Андрей Станиславович', '1965-03-26', '+7(982) 362-21-01', 17, '74-00-00000_', '2008-02-18', '2014-02-18', '75-09-722279', '2010-06-18', 'Отд.№3 УФМС России по Челябинской области в Ленинском р-не г.Магнитогорска', '740-029', 'г. Магнитогорск ул. Разина д. 13 кв.13', 1),
(6, 'Стаценко Алексей Александрович', '1982-06-09', '+7(906) 851-39-18', 18, '74-21-996384', '2015-03-05', '2024-03-05', '75-04-344984', '2004-09-24', 'УВД Орджоникидзевского  р-на г.Магнитогорска', '740-029', 'г. Магнитогорск ул. Тевосяна д.11/2 кв.47', 1),
(7, 'Цибарман Виталий Викторович', '1969-05-29', '+7(912) 311-07-38', 11, '74-30-995573', '2017-04-08', '2027-04-08', '75-14-466638', '2015-02-09', 'Отд. УФМС по Челябинской области в Каслинском р-не г.Магнитогорска ', '740-029', 'г. Магнитогорск ул. Сталеваров д.15/2 кв.7', 1),
(8, 'Моисеев Ян Сергеевич', '1991-10-01', '+7(963) 478-33-11', 15, '74-00-_23577', '2010-08-07', '2020-08-07', '75-12-091529', '2012-06-09', 'Отделом УФМС России по Челябинской области в Орджоникидзевском районе г.Магнитогорска', '740-027', 'г. Магнитогорск ул. Жукова д.17/1 кв.116', 1),
(9, 'Кирдиянов Сергей Геннадьевич', '1967-05-31', '+7(952) 500-38-08', 9, '99-08-504119', '2019-05-04', '2026-05-04', '75-12-092327', '2012-07-10', 'Отделом УФМС России по Челябинской области в Орджоникидзевском районе г.Магнитогорска', '740-027', 'г. Магнитогорск ул. Ворошилова д.1 кв.91', NULL),
(10, 'Онищенко Евгений Павлович', '1962-09-16', '+7(982) 346-67-49', 12, '74-16-688391', '2014-02-18', '2024-02-18', '75-07-118878', '2007-10-12', 'Отделением №1 УфМС России по Челябинской области в Орджоникидзевском р-не', '740-027', 'г.Магнитогорск ул.Труда д.5 кв.7', NULL),
(11, 'Маргацкий Константин Анатольевич', '1987-07-22', '+7(951) 456-17-93', 13, '74-04-750176', '2011-06-14', '2021-06-14', '75-05-826035', '2007-08-15', 'Отделением УФМС России по Челябинской области в Нагайбакском р-не', '740-032', 'Челябинская область Нагайбакский р-он Фершампенуаз Блюхера д.49', NULL),
(12, 'Баландина Татьяна Леонидовна', '1986-05-18', '+7(909) 098-36-41', 20, '99-03-024684', '2018-09-28', '2028-09-28', '75-07-194545', '2008-01-21', 'Отделением №2 УФМС России по Челябинской области в Правобережном р-не г.Магнитогорска', '740-028', 'г. Магнитогорск  ул.Доменщиков д.23 кв.48', 1),
(13, 'Брусникова Анастасия Олеговна', '1995-08-21', '+7(908) 069-64-13', NULL, '74-17-273384', '2014-07-12', '2022-07-12', '75-16-882551', '2016-12-23', 'Отделом УФМС России по Челябинской области в Орджоникидзевском районе г.Магнитогорска', '740-027', 'г. Магнитогорск  ул.Аэродромная д.30 кв.7', NULL),
(14, 'Теплов Константин', '1901-01-01', '+7(000) 000-00-00', 21, '00-00-000000', '1901-01-01', '2000-01-01', '00-00-000000', '1901-01-01', '000', '000-000', '0000', 1),
(15, 'Плотников Виталий Андреевич', '1992-09-26', '+7(919) 333-99-44', NULL, '59-10-217028', '2012-11-01', '2022-11-01', '57-02-951194', '2012-11-07', 'Отделом УФМС России по Пермскому краю в г.Березники', '740-028', 'г. Магнитогорск ул. Суворова  д. 116 корп. 4 кв.5', NULL),
(16, 'Ягольников Виктор Васильевич', '1957-07-14', '+7(909) 096-88-20', 19, '74-26-535031', '2016-04-26', '2026-04-26', '75-03-478368', '2003-04-23', 'УВД Орджоникидзевского р-на г.Магнитогорска', '742-023', 'г. Магнитогорск ул. Бориса Ручьева д.12 кв.133', 1),
(17, 'Тырин Александр', '2000-11-11', '+7(902) 890-16-89', 24, '0', '1901-01-01', '1000-01-01', '00-00-000000', '1901-01-01', '0', '000-000', '0', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `drivers2contracts`
--

CREATE TABLE `drivers2contracts` (
  `id` int(11) NOT NULL,
  `muz_contract_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `object` varchar(255) NOT NULL,
  `value` decimal(11,2) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `drivers2contracts`
--

INSERT INTO `drivers2contracts` (`id`, `muz_contract_id`, `driver_id`, `type`, `object`, `value`) VALUES
(1, 1, 17, 'gorod', 'что-то', '49.00'),
(2, 2, 1, 'pitanie', 'шавуха', '100.00'),
(3, 2, 2, 'avtobus', 'маршрутка', '25.00'),
(4, 3, 1, 'gruzovie', 'Хуй знает что', '10.00'),
(5, 4, 6, 'gruzovie', 'Тест', '100.00'),
(6, 5, 1, 'gorod', 'asdasd', '250.00'),
(7, 5, 2, 'komandirovki', 'adasd', '228.00');

-- --------------------------------------------------------

--
-- Структура таблицы `drivers2shifts`
--

CREATE TABLE `drivers2shifts` (
  `id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `object` varchar(255) NOT NULL,
  `value` decimal(11,2) NOT NULL,
  `hours` int(11) NOT NULL DEFAULT '0',
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `drivers2shifts`
--

INSERT INTO `drivers2shifts` (`id`, `shift_id`, `driver_id`, `type`, `object`, `value`, `hours`) VALUES
(1, 1, 1, 'pitanie', 'шавуха', '100.00', 1),
(2, 1, 2, 'avtobus', 'маршрутка', '25.00', 0),
(3, 2, 1, 'gruzovie', 'Хуй знает что', '10.00', 0),
(4, 3, 6, 'gruzovie', 'Тест', '150.00', 4),
(5, 4, 6, 'gruzovie', 'Тест', '100.00', 20),
(6, 5, 17, 'gorod', 'что-то', '49.00', 2),
(7, 6, 1, 'gorod', 'что-то', '49.00', 0),
(8, 7, 1, 'gorod', 'asdasd', '250.00', 0),
(9, 7, 2, 'komandirovki', 'adasd', '228.00', 0),
(10, 8, 1, 'gorod', 'asdasd', '250.00', 0),
(11, 8, 2, 'komandirovki', 'adasd', '228.00', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `access_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `middle_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `is_fired` tinyint(1) NOT NULL DEFAULT '0',
  `is_director` tinyint(1) NOT NULL DEFAULT '0',
  `is_senior_manager` tinyint(1) NOT NULL DEFAULT '0',
  `is_manager` tinyint(1) NOT NULL DEFAULT '1',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `employees`
--

INSERT INTO `employees` (`id`, `access_id`, `first_name`, `last_name`, `middle_name`, `phone`, `birthday`, `is_fired`, `is_director`, `is_senior_manager`, `is_manager`) VALUES
(1, NULL, 'Root', 'Root', 'Root', NULL, NULL, 0, 1, 1, 1),
(2, NULL, 'Мария', 'Орехова', 'Юльевна', '+79128007778', '1983-11-14', 0, 1, 0, 0),
(3, NULL, '4242344234234', '234234', '423434', '3424234234', '2019-08-23', 1, 1, 0, 0),
(4, NULL, 'asd', 'qwe', 'zxc', '123123123123', '2019-06-01', 1, 1, 0, 0),
(5, NULL, '23', '1', '3', '3213123', '2019-08-23', 0, 1, 0, 0),
(6, NULL, 'Анастасия', 'Брусникова', 'Олеговна', '+79080696413', '1995-08-21', 0, 0, 0, 1),
(7, NULL, 'Татьяна ', 'Баландина', 'Леонидовна', '+79028957255', '1986-05-18', 0, 0, 1, 0),
(8, NULL, 'Виталий', 'Плотников', 'Андреевич', '+79193339944', '1992-09-26', 0, 0, 1, 0),
(9, NULL, 'Игорь', 'Рязанцев', 'Викторович', '+79028952222', '1969-02-26', 0, 1, 0, 0),
(10, NULL, 'Сергей', 'Рязанцев', 'Викторович', '+79193015059', '1959-02-15', 0, 1, 0, 0),
(11, NULL, 'Лариса', 'Бухгалтер', 'Ларисовна', '+79630967453', '1990-01-01', 0, 0, 1, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `employees_access`
--

CREATE TABLE `employees_access` (
  `id` int(11) NOT NULL,
  `title` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `goods`
--

CREATE TABLE `goods` (
  `id` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `purchase_price` decimal(11,2) NOT NULL,
  `selling_price` decimal(11,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `incomes`
--

CREATE TABLE `incomes` (
  `id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `code` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `base_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `document_id` int(11) DEFAULT NULL,
  `base_other` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `cash_storage_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `comment` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `sum` decimal(11,2) NOT NULL,
  `date` date NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `incomes`
--

INSERT INTO `incomes` (`id`, `manager_id`, `code`, `base_id`, `document_id`, `base_other`, `cash_storage_id`, `customer_id`, `comment`, `sum`, `date`) VALUES
(1, 7, NULL, NULL, NULL, 'Остаток в кассе на 1.09.2019', 1, 26, '', '4100.00', '2019-09-01'),
(2, 7, NULL, NULL, NULL, 'Остаток на сбербанк онлайн на 1.09.2019', 2, 26, '', '65.00', '2019-09-01'),
(3, 7, NULL, NULL, NULL, 'Орехова М.Ю.', 2, 26, '', '4000.00', '2019-09-01'),
(4, 7, NULL, NULL, NULL, 'Орехова М.Ю.', 2, 26, '', '5000.00', '2019-09-02'),
(5, 7, NULL, NULL, NULL, 'Из наличные оф.219', 2, 26, '', '20000.00', '2019-09-02'),
(6, 7, NULL, NULL, NULL, 'Плотников сдача с монитора', 1, 26, '', '800.00', '2019-09-01'),
(7, 7, NULL, NULL, NULL, 'аренда Гранта белая 203', 1, 27, '', '450.00', '2019-09-01');

-- --------------------------------------------------------

--
-- Структура таблицы `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `file` varchar(255) DEFAULT NULL,
  `manager_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `base_id` int(11) NOT NULL,
  `sum` decimal(11,2) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `closed` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `invoices`
--

INSERT INTO `invoices` (`id`, `file`, `manager_id`, `customer_id`, `code`, `base_id`, `sum`, `closed`) VALUES
(1, 'invoice.1567583130295.xlsx', 7, 28, 'CRR', 5, '5400.00', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `itineraries`
--

CREATE TABLE `itineraries` (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `price` decimal(11,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `itineraries`
--

INSERT INTO `itineraries` (`id`, `name`, `price`) VALUES
(2, 'Аэропорт- Форум', '600.00'),
(3, 'Магнитогорск - Екатеринбург', '9000.00'),
(4, 'Форум - Аэропорт', '600.00'),
(5, 'Форум - Арена Металлург', '1800.00'),
(6, ' Арена Металлург - Форум', '800.00'),
(7, 'Аэропорт - Арена Металлург', '1800.00'),
(8, 'Свадьба', '0.00'),
(9, 'Хуй - жопа', '1488.00');

-- --------------------------------------------------------

--
-- Структура таблицы `managers`
--

CREATE TABLE `managers` (
  `id` int(11) NOT NULL,
  `login` varchar(55) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `employee_id` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `managers`
--

INSERT INTO `managers` (`id`, `login`, `password`, `employee_id`) VALUES
(1, 'root', '202cb962ac59075b964b07152d234b70', 1),
(2, 'Mariya Ulevna', '202cb962ac59075b964b07152d234b70', 2),
(3, 'test', '202cb962ac59075b964b07152d234b70', 3),
(4, 'zxc cxz', '202cb962ac59075b964b07152d234b70', 4),
(5, 'Test1', '202cb962ac59075b964b07152d234b70', 5),
(6, 'Leonova', '1bbd886460827015e5d605ed44252251', 6),
(7, 'Balandina', 'bae5e3208a3c700e3db642b6631e95b9', 7),
(8, 'Plotnikov', 'd27d320c27c3033b7883347d8beca317', 8),
(9, 'Igor', 'b857eed5c9405c1f2b98048aae506792', 9),
(10, 'SV', 'f638f4354ff089323d1a5f78fd8f63ca', 10),
(11, 'Larisa', '25d55ad283aa400af464c76d713c07ad', 11);

-- --------------------------------------------------------

--
-- Структура таблицы `muz_contracts`
--

CREATE TABLE `muz_contracts` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `date_start` date NOT NULL,
  `date_end` date NOT NULL,
  `gorod_hours` int(11) DEFAULT NULL,
  `gorod_value` decimal(11,2) DEFAULT NULL,
  `gorod_ostatki_hours` int(11) DEFAULT NULL,
  `gorod_ostatki_value` decimal(11,2) DEFAULT NULL,
  `komandirovki_hours` int(11) DEFAULT NULL,
  `komandirovki_value` decimal(11,2) DEFAULT NULL,
  `gruzovie_hours` int(11) DEFAULT NULL,
  `gruzovie_value` decimal(11,2) DEFAULT NULL,
  `pitanie_hours` int(11) DEFAULT NULL,
  `pitanie_value` decimal(11,2) DEFAULT NULL,
  `avtobus_hours` int(11) DEFAULT NULL,
  `avtobus_value` decimal(11,2) DEFAULT NULL,
  `vnedorozhnik_hours` int(11) DEFAULT NULL,
  `vnedorozhnik_value` decimal(11,2) DEFAULT NULL,
  `pomosh_hours` int(11) DEFAULT NULL,
  `pomosh_value` decimal(11,2) DEFAULT NULL,
  `other_name` varchar(255) DEFAULT NULL,
  `other_hours` int(11) DEFAULT NULL,
  `other_value` decimal(11,2) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `comment` text,
  `total_value` decimal(11,2) NOT NULL,
  `total_hours` int(11) NOT NULL,
  `cash_security` decimal(11,2) NOT NULL DEFAULT '0.00',
  `is_completed` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `muz_contracts`
--

INSERT INTO `muz_contracts` (`id`, `customer_id`, `date_start`, `date_end`, `gorod_hours`, `gorod_value`, `gorod_ostatki_hours`, `gorod_ostatki_value`, `komandirovki_hours`, `komandirovki_value`, `gruzovie_hours`, `gruzovie_value`, `pitanie_hours`, `pitanie_value`, `avtobus_hours`, `avtobus_value`, `vnedorozhnik_hours`, `vnedorozhnik_value`, `pomosh_hours`, `pomosh_value`, `other_name`, `other_hours`, `other_value`, `manager_id`, `comment`, `total_value`, `total_hours`, `cash_security`, `is_completed`) VALUES
(1, 1, '2019-09-18', '2019-09-22', 12, '50.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '0.00', 1, NULL, '2400.00', 24, '0.00', 0),
(2, 5, '2019-09-18', '2019-09-19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 20, '100.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '0.00', 1, NULL, '322.00', 100, '1488.00', 0),
(3, 25, '2019-09-25', '2019-09-26', NULL, NULL, NULL, NULL, NULL, NULL, 5, '1000.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '0.00', 1, NULL, '5000.00', 5, '10000.00', 0),
(4, 27, '2019-10-01', '2019-10-02', 30, '500.00', NULL, NULL, NULL, NULL, 24, '1000.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '0.00', 1, 'хуй хуй хуй', '24000.00', 30, '10000.00', 1),
(5, 4, '2019-10-03', '2019-10-04', 24, '500.00', NULL, NULL, 12, '1000.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '1500.00', 36, '0.00', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `passengers`
--

CREATE TABLE `passengers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `contact_number` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `passengers`
--

INSERT INTO `passengers` (`id`, `name`, `contact_number`, `birthday`) VALUES
(1, 'Орлов Денис', '+7(925) 244-24-24', '2019-09-02'),
(2, 'Китайцы', '+7(111) 111-11-11', '0001-01-01'),
(3, 'ХК СКА', '+7(000) 000-00-00', NULL),
(4, 'АПассажир (пустой)', '+7(000) 000-00-00', '1901-01-01'),
(5, 'Маркин Алексей Васильевич', '+7(919) 110-07-73', '0001-01-01'),
(138, 'Пантелеев Дмитрий Олегович', '+7(926) 156-56-36', NULL),
(139, 'Моторкин Вадим Александрович', '+7(926) 532-86-28', NULL),
(140, 'Скобочкин Антон Михайлович', '+7(926) 001-10-64', NULL),
(141, 'Андросов Виктор Викторович', '+7(925) 355-90-60', NULL),
(142, 'Урбан Артем Владимирович', '+7(926) 494-45-50', NULL),
(143, 'Жаббаров Рустам Ахмятович', '+7(926) 565-98-88', NULL),
(144, 'Коген Дмитрий Александрович', '+7(916) 955-99-96', NULL),
(145, 'Катков Кирил Сергеевич', '+7(915) 365-57-58', NULL),
(146, 'Евтушенко Евгений Игоревич', '+7(926) 800-56-90', NULL),
(147, 'Чувикин Александр Геннадьевич', '+7(967) 535-04-32', NULL),
(148, 'Кузнецов Артем Анатольевич', '+7(967) 132-95-56', NULL),
(149, 'Яблоков Владимир Филиппович', '+7(968) 593-20-68', NULL),
(150, 'Нечаев Олег Юрьевич', '+7(903) 178-43-70', NULL),
(151, 'Домрачев Георгий Вячеславович', '+7(905) 785-96-03', NULL),
(152, 'Матвеев Сергей Сергеевич', '+7(903) 509-88-41', NULL),
(153, 'Дугай Инна Александровна', '+7(926) 958-33-36', NULL),
(154, 'Павлович Кирилл Викторович', '+7(965) 410-50-46', NULL),
(155, 'Кокин Сергей Владимирович', '+7(903) 139-42-94', NULL),
(156, 'Воронин Михаил', '+7(915) 080-59-95', NULL),
(157, 'Ясько Татьяна Викторовна', '+7(903) 091-33-00', NULL),
(158, 'Акимов Константин', '+7(915) 080-59-95', NULL),
(159, 'Прохоренко Данил Филиппович', '+7(912) 805-65-03', '1990-06-28'),
(160, 'Зоткина Ксения Юрьевна', '+7(909) 095-29-53', '1990-09-03'),
(161, 'Симакова Наталья Петровна', '+7(903) 091-28-41', NULL),
(162, 'Виталий Гоцкин', '+7(777) 783-43-45', NULL),
(163, 'Штефан Александр', '+7(912) 908-74-78', NULL),
(164, 'Колпакова Мария Валерьевна', '+7(916) 475-94-92', '1982-03-03'),
(165, 'Демешко Александр Владимирович', '+7(919) 312-92-25', '1982-10-11'),
(166, 'Коршунова Надежда', NULL, NULL),
(167, 'Ростовцев Евгений Сергеевич', '+7(963) 093-58-07', NULL),
(168, 'Байкалов Олег', '+7(963) 093-58-07', NULL),
(169, 'Каменев Александр', '+7(985) 226-47-65', NULL),
(170, 'Константин Ляхов', '+7(915) 101-01-84', NULL),
(171, 'Чертищев Сергей Алексеевич', NULL, NULL),
(172, 'Kunde Elia Frank (Кундэ Элиа Франк', '+7(963) 476-58-51', '1964-03-15'),
(173, 'Стошич Горан', '+7(912) 400-02-44', '1996-04-23'),
(174, 'Каримов Ансар Рауфович', '+7(996) 582-53-36', '1982-05-18'),
(175, 'Хасенов Акжул Абубакирович', '+7(982) 304-68-31', '1964-09-28'),
(176, 'Шамсутдинова Людмила Владимировна', '+7(964) 247-29-20', '1964-10-04'),
(177, 'Акназаров Фанис Фаритович', '+7(912) 302-00-60', '1978-05-29'),
(178, 'Савина Наталья Евгеньевна', '+7(906) 851-35-50', '1978-02-02'),
(179, 'Кузьмина Татьяна Валерьевна', '+7(912) 796-80-07', '1995-06-08'),
(180, 'Абдрахимов Рустам Рифович', '+7(952) 505-66-60', '1988-05-06'),
(181, 'Белоусов Алексей Сергеевич', '+7(952) 518-88-23', '1992-04-14'),
(182, 'Вавилова Ирина', '+7(906) 872-34-70', NULL),
(183, 'Эмих Елена Юрьевна', '+7(912) 896-83-87', NULL),
(184, 'Разинькова Эльвира Зиннатовна', '+7(908) 045-48-44', '1990-04-24'),
(185, 'D’onghia Ivan', NULL, NULL),
(186, 'Усков Александр Иванович', '+7(951) 251-69-01', '1967-01-11'),
(187, 'Скороходова Юлия Юрьевна', '+7(903) 765-24-24', '1969-07-22'),
(188, 'Барчина Владислав Вячеславович', NULL, '1978-07-22'),
(189, 'Калаченко Алексей Евгеньевич', '+7(926) 204-53-28', '1975-03-21'),
(190, 'Мирославский Сергей Викторович', '+7(912) 476-32-50', '1985-08-19'),
(191, 'Колпакова Мария Валерьевна', '+7(916) 475-94-92', '1982-03-03'),
(192, 'Варич Маргарита Владимировна', '+7(985) 777-13-13', '1979-05-27'),
(193, 'Арцыбашев Павел Сергеевич', '+7(909) 904-23-45', '1979-07-28'),
(194, 'Прохоренко Данил Филиппович', '+7(912) 805-65-03', '1990-06-28'),
(195, 'Карченкова Маоия Олеговна', '+7(966) 306-13-77', '1990-04-28'),
(196, 'Паршутин Вячеслав Викторович', '+7(982) 313-07-37', NULL),
(197, 'Вильданов Рафкат Рафаилович', '+7(968) 667-16-01', '1984-03-25'),
(198, 'Нуждин Владимир Николаевич', '+7(916) 555-07-58', '1956-05-25'),
(199, 'Ласенко Дмитрий Павлович', '+7(915) 007-91-12', '1989-11-06'),
(200, 'Мендиола Осорио Хосе Рамон', '+7(909) 093-93-29', '1986-06-16'),
(201, 'Салий Алексей Анатольевич', '+7(903) 961-91-44', '1974-06-01'),
(202, 'Таболин Александр Николаевич', '+7(909) 280-22-02', '1964-12-08'),
(203, 'Ушнурцев Сергей Николаевич', '+7(985) 999-86-94', '1959-07-02'),
(204, 'Терехова Мария Владимировна', '+7(909) 996-85-31', '1975-12-06'),
(205, 'Каллин Олег Владимирович', '+7(922) 824-88-21', '1971-11-13'),
(206, 'Стронилов Александр Геннадьевич', '+7(967) 867-79-89', NULL),
(207, 'Рябиков Артем Сергеевич', '+7(982) 289-44-82', '1991-05-23'),
(208, 'Удалова Олеся Зинуровна', '+7(992) 507-83-94', '1986-12-03'),
(209, 'Ярмухаметов Ильдус Нурович', '+7(963) 891-82-15', '1988-11-05'),
(210, 'Федотов Илья Дмитриевич', '+7(926) 300-83-33', '1987-02-28'),
(211, 'Проданович Зоран', '+7(351) 901-11-78', '1963-07-07'),
(212, 'Шумов Евгений Юрьевич', '+7(909) 049-35-53', '1984-10-19'),
(213, 'Фазуллин Альберт Радикович', '+7(951) 456-15-42', '1990-04-12'),
(214, 'Тоболин Александр Николаевич', '+7(909) 280-22-02', '1964-12-08'),
(215, 'Кудряшов Валерий Николаевич', '+7(906) 852-18-17', '1982-08-26'),
(216, 'Хачин Сергей Николаевич', NULL, '1962-12-14'),
(217, 'Круг Константин Георгиевич', '+7(922) 206-13-67', '1965-09-14'),
(218, 'Рыспаев Самат  Байгунысович', '+7(950) 559-20-63', '1985-01-04'),
(219, 'Кроча Даниэль', NULL, NULL),
(220, 'Трубицина Дарья Владимировна', '+7(951) 477-61-39', NULL),
(221, 'Курочкин Денис Игоревич', '+7(908) 572-55-65', NULL),
(222, 'Побединский Захар Игоревич', '+7(951) 961-03-96', NULL),
(223, 'Миньшина Алина Рамилевна', '+7(922) 755-02-84', NULL),
(224, 'Ростовцев Евгений Сергеевич', '+7(963) 093-58-07', NULL),
(225, 'Силина Юлия Леонидовна', '+7(906) 898-25-57', NULL),
(226, 'Толмачев Константин Андреевич', '+7(951) 257-10-61', NULL),
(227, 'Кажаев Иван Андреевич', '+7(908) 046-46-45', NULL),
(228, 'Кузнецова Дарья Юрьевна', '+7(909) 099-56-45', NULL),
(229, 'Баринов Игорь', '+7(985) 766-63-78', NULL),
(230, 'Лактионов Дмитрий', '+7(951) 242-93-50', NULL),
(231, 'Терехов Артем Анатольевич', '+7(915) 001-58-46', NULL),
(232, 'Кармацких Елена', '+7(967) 635-35-64', NULL),
(233, 'Закирова Айгуль', '+7(987) 600-39-22', NULL),
(234, 'Чепрасов Никита', '+7(912) 582-39-09', NULL),
(235, 'Michael Kapphahn', NULL, NULL),
(236, 'Фисенкова Елена', '+7(912) 310-76-88', NULL),
(237, 'Сергей Кипр', '+7(985) 923-43-43', NULL),
(238, 'Соловьев Александр Александрович', '+7(904) 301-76-65', '1983-09-20'),
(239, 'Кручинин Владимир Николаевич', '+7(902) 263-84-34', NULL),
(240, 'Пилинцов Павел Владимирович', '+7(902) 890-01-89', '1986-03-06'),
(241, 'Макаров Андрей  Вячеславович', '+7(982) 108-90-75', '1993-03-09'),
(242, 'Юлаев Захар Викторович', '+7(912) 775-58-88', '1979-12-19'),
(243, 'Дюсебаев Нуржан Тулегенович', '+7(919) 353-36-69', '1994-10-23'),
(244, 'Архипов Александр Иванович', '+7(909) 747-72-04', '1995-10-28'),
(245, 'Лопатин Дмитрий Николаевич', '+7(922) 015-62-53', '1984-10-08'),
(246, 'Байгильдин Рустам Зиннурович', '+7(963) 895-97-24', '1989-08-26'),
(247, 'Савельев Артем Анатольевич', '+7(964) 586-35-21', NULL),
(248, 'Прыкин Леонид Александрович', '+7(922) 744-01-83', '1974-05-18'),
(249, 'Дегтярев Михаил Григорьевич', '+7(961) 105-93-55', NULL),
(250, 'Чернышков Константин', '+7(908) 077-40-77', NULL),
(251, 'Джанбул Кушукбаев', '+7(912) 309-59-00', NULL),
(252, 'Аракелян Владимир', '+7(964) 247-47-47', NULL),
(253, 'Захарова Кристина Сергеевна', '+7(963) 096-31-46', NULL),
(254, 'Волкова Дарья Михайловна', '+7(951) 473-50-32', NULL),
(255, 'ЧЕПЛАГИНА ОЛЬГА', '+7(921) 308-18-63', NULL),
(256, 'Черников Михаил', '+7(906) 853-21-60', NULL),
(257, 'Иванов Иван Иванович', '+7(951) 251-77-11', NULL),
(258, 'Мамыкин Иван Алексеевич', '+7(905) 838-58-79', NULL),
(259, 'Унакафов Аскербий', '+7(985) 863-18-34', NULL),
(260, 'Смолина Елена', '+7(904) 940-10-29', NULL),
(261, 'Петренко Владимир', '+7(920) 203-53-47', NULL),
(262, 'Пестрикова Маргарита', '+7(912) 405-03-40', NULL),
(263, 'Унакафов Аскербий Асланович', '+7(985) 863-18-34', NULL),
(264, 'Газизов Артем Валентинович', '+7(911) 991-58-13', NULL),
(265, 'Прищик Жанна', '+7(925) 330-43-63', NULL),
(266, 'Владимир Герасичев', '+7(903) 795-13-53', NULL),
(267, 'Ильиных Анна', '+7(902) 502-94-52', NULL),
(268, 'Сатаев Ильдар', '+7(917) 426-28-17', NULL),
(269, 'Госниц Максим', '+7(963) 091-23-47', NULL),
(270, 'asdasdasd', NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `salary_reports`
--

CREATE TABLE `salary_reports` (
  `id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `period_left` date NOT NULL,
  `period_right` date NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `sum` decimal(11,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `salary_reports_details`
--

CREATE TABLE `salary_reports_details` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `reserv_id` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `sales_goods`
--

CREATE TABLE `sales_goods` (
  `id` int(11) NOT NULL,
  `good_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `is_purchase_price` tinyint(1) NOT NULL,
  `count` int(11) NOT NULL,
  `price` decimal(11,2) NOT NULL,
  `sum` decimal(11,2) NOT NULL,
  `percent_admin` decimal(11,2) DEFAULT NULL,
  `percent_admin_count` int(11) NOT NULL,
  `comment` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `sales_services`
--

CREATE TABLE `sales_services` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `master_id` int(11) NOT NULL,
  `price` decimal(11,2) NOT NULL,
  `percent_master` decimal(11,2) DEFAULT NULL,
  `percent_master_count` int(11) NOT NULL,
  `percent_admin` decimal(11,2) DEFAULT NULL,
  `percent_admin_count` int(11) NOT NULL,
  `comment` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `shifts`
--

CREATE TABLE `shifts` (
  `id` int(11) NOT NULL,
  `contract_id` int(11) NOT NULL,
  `date_start` int(11) NOT NULL,
  `created_at` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `shifts2contracts`
--

CREATE TABLE `shifts2contracts` (
  `id` int(11) NOT NULL,
  `contract_id` int(11) NOT NULL,
  `comment` text,
  `date_start` date NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `complete_at` timestamp NULL DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `manager_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `shifts2contracts`
--

INSERT INTO `shifts2contracts` (`id`, `contract_id`, `comment`, `date_start`, `is_completed`, `complete_at`, `manager_id`) VALUES
(1, 2, 'asdasdsdasd', '2019-09-22', 0, NULL, 1),
(2, 3, '', '2019-09-25', 0, NULL, 1),
(3, 4, 'фывфывфыв', '2019-10-01', 1, '2019-10-01 09:32:45', 1),
(4, 4, '', '2019-10-02', 1, '2019-10-01 10:27:25', 1),
(5, 1, '', '2019-10-01', 1, '2019-10-01 13:40:05', 1),
(6, 1, '', '2019-10-01', 0, NULL, 1),
(7, 5, '', '2019-10-03', 0, NULL, 1),
(8, 5, '', '2019-10-03', 0, NULL, 1);

-- --------------------------------------------------------

--
-- Структура таблицы `sms_notifications`
--

CREATE TABLE `sms_notifications` (
  `id` int(11) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `message` text,
  `customer_id` int(11) NOT NULL,
  `sms_id` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `error` text,
  `cost` decimal(11,2) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `birthday` date DEFAULT NULL,
  `driver_license_issue_date` date DEFAULT NULL,
  `driver_license_expiration_date` date DEFAULT NULL,
  `passport_issue_date` date DEFAULT NULL,
  `passport_issued_by` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `passport_division_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `location` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `is_legal_entity` tinyint(1) NOT NULL COMMENT 'Юридическое лицо?',
  `legal_address` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `actual_address` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `ogrn` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `inn` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `r_account` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `k_account` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `bik` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `passport` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `driver_license` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact_number` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `discount` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Дамп данных таблицы `suppliers`
--

INSERT INTO `suppliers` (`id`, `birthday`, `driver_license_issue_date`, `driver_license_expiration_date`, `passport_issue_date`, `passport_issued_by`, `passport_division_code`, `location`, `is_legal_entity`, `legal_address`, `actual_address`, `email`, `ogrn`, `inn`, `bank_name`, `r_account`, `k_account`, `bik`, `name`, `passport`, `driver_license`, `contact_number`, `discount`) VALUES
(1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '455023, г. Магнитогорск, ул. Ленинградская, 3\\1-46', '455023, г. Магнитогорск, ул. Ленинградская, 3\\1-46', '-', '308744430200019', '021102010637', 'Банк «Снежинский» ОАО г. Снежинск', '40802810007000041224', '30101810600000000799', '047501799', 'ИП Калашников Александр Анатольевич', NULL, NULL, '+7(906) 854-13-25', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `suppliers_deals`
--

CREATE TABLE `suppliers_deals` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `position_id` decimal(11,2) NOT NULL COMMENT 'Объект сделки',
  `sum` decimal(11,2) NOT NULL COMMENT 'Сумма сделки',
  `manager_id` int(11) NOT NULL,
  `date` date NOT NULL COMMENT 'дата сделки',
  `is_paid` tinyint(1) NOT NULL DEFAULT '0',
  `paid_at` datetime DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `suppliers_positions`
--

CREATE TABLE `suppliers_positions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `cost` decimal(11,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `act_sverki_documents`
--
ALTER TABLE `act_sverki_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `act_sverki_documents_details`
--
ALTER TABLE `act_sverki_documents_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`);

--
-- Индексы таблицы `act_sverki_suppliers_documents`
--
ALTER TABLE `act_sverki_suppliers_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `act_sverki_suppliers_documents_details`
--
ALTER TABLE `act_sverki_suppliers_documents_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`);

--
-- Индексы таблицы `act_works`
--
ALTER TABLE `act_works`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `additional_services`
--
ALTER TABLE `additional_services`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `apartments`
--
ALTER TABLE `apartments`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `apartment_reservations`
--
ALTER TABLE `apartment_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `apartment_id` (`apartment_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `passenger_id` (`passenger_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `balance`
--
ALTER TABLE `balance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Индексы таблицы `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `cars_reservations`
--
ALTER TABLE `cars_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `car_id` (`car_id`),
  ADD KEY `itinerarie_id` (`itinerarie_id`),
  ADD KEY `passenger_id` (`passenger_id`);

--
-- Индексы таблицы `cash_storages`
--
ALTER TABLE `cash_storages`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `coming_goods`
--
ALTER TABLE `coming_goods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `good_id` (`good_id`);

--
-- Индексы таблицы `costs`
--
ALTER TABLE `costs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cash_storage_id` (`cash_storage_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `manager_id` (`manager_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Индексы таблицы `costs_categories`
--
ALTER TABLE `costs_categories`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `detailing_apartments`
--
ALTER TABLE `detailing_apartments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `detailing_apartments_details`
--
ALTER TABLE `detailing_apartments_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `detailing_id` (`detailing_id`),
  ADD KEY `reserv_id` (`reserv_id`);

--
-- Индексы таблицы `detailing_cars`
--
ALTER TABLE `detailing_cars`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `detailing_cars_details`
--
ALTER TABLE `detailing_cars_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `detailing_id` (`detailing_id`),
  ADD KEY `reserv_id` (`reserv_id`);

--
-- Индексы таблицы `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `drivers2contracts`
--
ALTER TABLE `drivers2contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `muz_contract_id` (`muz_contract_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Индексы таблицы `drivers2shifts`
--
ALTER TABLE `drivers2shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `muz_contract_id` (`shift_id`);

--
-- Индексы таблицы `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `access_id` (`access_id`);

--
-- Индексы таблицы `employees_access`
--
ALTER TABLE `employees_access`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `goods`
--
ALTER TABLE `goods`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `incomes`
--
ALTER TABLE `incomes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cash_storage_id` (`cash_storage_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `itineraries`
--
ALTER TABLE `itineraries`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `managers`
--
ALTER TABLE `managers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Индексы таблицы `muz_contracts`
--
ALTER TABLE `muz_contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `passengers`
--
ALTER TABLE `passengers`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `salary_reports`
--
ALTER TABLE `salary_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `salary_reports_details`
--
ALTER TABLE `salary_reports_details`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `sales_goods`
--
ALTER TABLE `sales_goods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `good_id` (`good_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Индексы таблицы `sales_services`
--
ALTER TABLE `sales_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `master_id` (`master_id`);

--
-- Индексы таблицы `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `shifts2contracts`
--
ALTER TABLE `shifts2contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `muz_contract_id` (`contract_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Индексы таблицы `sms_notifications`
--
ALTER TABLE `sms_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Индексы таблицы `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `suppliers_deals`
--
ALTER TABLE `suppliers_deals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `position_id` (`position_id`);

--
-- Индексы таблицы `suppliers_positions`
--
ALTER TABLE `suppliers_positions`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `act_sverki_documents`
--
ALTER TABLE `act_sverki_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `act_sverki_documents_details`
--
ALTER TABLE `act_sverki_documents_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `act_sverki_suppliers_documents`
--
ALTER TABLE `act_sverki_suppliers_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `act_sverki_suppliers_documents_details`
--
ALTER TABLE `act_sverki_suppliers_documents_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `act_works`
--
ALTER TABLE `act_works`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `additional_services`
--
ALTER TABLE `additional_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `apartments`
--
ALTER TABLE `apartments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `apartment_reservations`
--
ALTER TABLE `apartment_reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `balance`
--
ALTER TABLE `balance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `cars`
--
ALTER TABLE `cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT для таблицы `cars_reservations`
--
ALTER TABLE `cars_reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `cash_storages`
--
ALTER TABLE `cash_storages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `coming_goods`
--
ALTER TABLE `coming_goods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `costs`
--
ALTER TABLE `costs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `costs_categories`
--
ALTER TABLE `costs_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT для таблицы `detailing_apartments`
--
ALTER TABLE `detailing_apartments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `detailing_apartments_details`
--
ALTER TABLE `detailing_apartments_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `detailing_cars`
--
ALTER TABLE `detailing_cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `detailing_cars_details`
--
ALTER TABLE `detailing_cars_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT для таблицы `drivers2contracts`
--
ALTER TABLE `drivers2contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `drivers2shifts`
--
ALTER TABLE `drivers2shifts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT для таблицы `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT для таблицы `employees_access`
--
ALTER TABLE `employees_access`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `goods`
--
ALTER TABLE `goods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `incomes`
--
ALTER TABLE `incomes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `itineraries`
--
ALTER TABLE `itineraries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `managers`
--
ALTER TABLE `managers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT для таблицы `muz_contracts`
--
ALTER TABLE `muz_contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `passengers`
--
ALTER TABLE `passengers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=271;

--
-- AUTO_INCREMENT для таблицы `salary_reports`
--
ALTER TABLE `salary_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `salary_reports_details`
--
ALTER TABLE `salary_reports_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `sales_goods`
--
ALTER TABLE `sales_goods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `sales_services`
--
ALTER TABLE `sales_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `shifts2contracts`
--
ALTER TABLE `shifts2contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `sms_notifications`
--
ALTER TABLE `sms_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `suppliers_deals`
--
ALTER TABLE `suppliers_deals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `suppliers_positions`
--
ALTER TABLE `suppliers_positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `act_sverki_documents_details`
--
ALTER TABLE `act_sverki_documents_details`
  ADD CONSTRAINT `act_sverki_documents_details_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `act_sverki_documents` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `apartment_reservations`
--
ALTER TABLE `apartment_reservations`
  ADD CONSTRAINT `apartment_reservations_ibfk_1` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`),
  ADD CONSTRAINT `apartment_reservations_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `apartment_reservations_ibfk_4` FOREIGN KEY (`passenger_id`) REFERENCES `passengers` (`id`);

--
-- Ограничения внешнего ключа таблицы `cars_reservations`
--
ALTER TABLE `cars_reservations`
  ADD CONSTRAINT `cars_reservations_ibfk_1` FOREIGN KEY (`passenger_id`) REFERENCES `passengers` (`id`),
  ADD CONSTRAINT `cars_reservations_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `cars_reservations_ibfk_3` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`),
  ADD CONSTRAINT `cars_reservations_ibfk_4` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  ADD CONSTRAINT `cars_reservations_ibfk_6` FOREIGN KEY (`itinerarie_id`) REFERENCES `itineraries` (`id`);

--
-- Ограничения внешнего ключа таблицы `detailing_apartments_details`
--
ALTER TABLE `detailing_apartments_details`
  ADD CONSTRAINT `detailing_apartments_details_ibfk_1` FOREIGN KEY (`detailing_id`) REFERENCES `detailing_apartments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detailing_apartments_details_ibfk_2` FOREIGN KEY (`reserv_id`) REFERENCES `apartment_reservations` (`id`);

--
-- Ограничения внешнего ключа таблицы `detailing_cars_details`
--
ALTER TABLE `detailing_cars_details`
  ADD CONSTRAINT `detailing_cars_details_ibfk_1` FOREIGN KEY (`detailing_id`) REFERENCES `detailing_cars` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
