-- Adminer 5.4.2 MySQL 8.4.8 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP DATABASE IF EXISTS `lokea`;
CREATE DATABASE `lokea` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_hungarian_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `lokea`;

DELIMITER ;;

CREATE EVENT `expire_abandoned_sessions` ON SCHEDULE EVERY 1 HOUR STARTS '2026-05-04 20:06:48' ON COMPLETION NOT PRESERVE ENABLE DO UPDATE game_sessions
    SET finished_at = CURRENT_TIMESTAMP
    WHERE finished_at IS NULL
      AND COALESCE(
          (SELECT MAX(guessed_at) FROM session_guesses WHERE session_guesses.session_id = game_sessions.session_id),
          started_at
      ) < DATE_SUB(NOW(), INTERVAL 2 HOUR);;

DELIMITER ;

DROP TABLE IF EXISTS `admin_settings`;
CREATE TABLE `admin_settings` (
  `settings_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `darkmode` tinyint(1) DEFAULT '0',
  `selected_chart` varchar(20) COLLATE utf8mb3_hungarian_ci DEFAULT 'activity-week',
  PRIMARY KEY (`settings_id`),
  UNIQUE KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_settings_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;


DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `user_id` int NOT NULL,
  `game_maps_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`game_maps_id`),
  KEY `game_maps_id` (`game_maps_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`game_maps_id`) REFERENCES `game_maps` (`game_maps_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `favorites` (`user_id`, `game_maps_id`) VALUES
(1,	2),
(1,	4);

DROP TABLE IF EXISTS `game_maps`;
CREATE TABLE `game_maps` (
  `game_maps_id` int NOT NULL AUTO_INCREMENT,
  `creator_id` int DEFAULT NULL,
  `title` varchar(50) COLLATE utf8mb3_hungarian_ci NOT NULL DEFAULT 'Névtelen pálya',
  `cover_image_id` int DEFAULT NULL,
  `game_description` varchar(255) COLLATE utf8mb3_hungarian_ci NOT NULL DEFAULT 'Nem található leírás',
  `game_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`game_maps_id`),
  KEY `creator_id` (`creator_id`),
  KEY `cover_image_id` (`cover_image_id`),
  CONSTRAINT `game_maps_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `game_maps_ibfk_2` FOREIGN KEY (`cover_image_id`) REFERENCES `images` (`image_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `game_maps` (`game_maps_id`, `creator_id`, `title`, `cover_image_id`, `game_description`, `game_created`) VALUES
(1,	1,	'PowerGYM',	3,	'Szeretett kedvenc kondinkól egy pálya',	'2026-05-04 20:15:03'),
(2,	1,	'Névtelen pálya',	NULL,	'Nem található leírás',	'2026-05-04 20:15:05'),
(3,	1,	'Erdő pálya',	1,	'Nem található leírás',	'2026-05-04 20:15:06'),
(4,	1,	'Templomok a világ körül',	2,	'Ezen a pályán templomok vannak a világ körül',	'2026-05-04 20:15:07'),
(5,	1,	'Névtelen pálya',	NULL,	'Nem található leírás',	'2026-05-04 20:15:09'),
(6,	1,	'Névtelen pálya',	NULL,	'Nem található leírás',	'2026-05-04 20:15:11');

DROP TABLE IF EXISTS `game_maps_comments`;
CREATE TABLE `game_maps_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `game_maps_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `comment_text` varchar(255) COLLATE utf8mb3_hungarian_ci DEFAULT NULL,
  `rating` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  UNIQUE KEY `unique_comment_per_user_per_map` (`game_maps_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `game_maps_comments_ibfk_1` FOREIGN KEY (`game_maps_id`) REFERENCES `game_maps` (`game_maps_id`) ON DELETE CASCADE,
  CONSTRAINT `game_maps_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `check_rating_range` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `game_maps_comments` (`comment_id`, `game_maps_id`, `user_id`, `comment_text`, `rating`, `created_at`) VALUES
(1,	3,	1,	NULL,	3,	'2026-05-04 20:15:34'),
(2,	4,	1,	'Csodás pálya',	5,	'2026-05-04 20:16:47'),
(3,	1,	1,	'Nagy szélben táncol az épület',	1,	'2026-05-04 20:28:24'),
(4,	1,	2,	'De azért pofás',	5,	'2026-05-04 20:59:54');

DROP TABLE IF EXISTS `game_sessions`;
CREATE TABLE `game_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `game_maps_id` int NOT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `finished_at` timestamp NULL DEFAULT NULL,
  `current_cycle` int NOT NULL DEFAULT '1',
  `current_round` int NOT NULL DEFAULT '0',
  `rounds` int NOT NULL DEFAULT '5',
  `time_per_round` int NOT NULL DEFAULT '30',
  `current_point_id` int DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `current_point_id` (`current_point_id`),
  KEY `user_id` (`user_id`),
  KEY `game_maps_id` (`game_maps_id`),
  CONSTRAINT `game_sessions_ibfk_1` FOREIGN KEY (`current_point_id`) REFERENCES `points` (`point_id`) ON DELETE SET NULL,
  CONSTRAINT `game_sessions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `game_sessions_ibfk_3` FOREIGN KEY (`game_maps_id`) REFERENCES `game_maps` (`game_maps_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `game_sessions` (`session_id`, `user_id`, `game_maps_id`, `started_at`, `finished_at`, `current_cycle`, `current_round`, `rounds`, `time_per_round`, `current_point_id`) VALUES
(1,	1,	1,	'2026-05-04 20:56:16',	'2026-05-04 20:56:59',	1,	5,	5,	30,	NULL);

DROP TABLE IF EXISTS `images`;
CREATE TABLE `images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `width` int NOT NULL,
  `height` int NOT NULL,
  `filepath` varchar(255) COLLATE utf8mb3_hungarian_ci NOT NULL,
  PRIMARY KEY (`image_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `images` (`image_id`, `width`, `height`, `filepath`) VALUES
(1,	4096,	2048,	'1\\3\\3_e7bc92fb.webp'),
(2,	1920,	960,	'1\\4\\4_ded67d8e.webp'),
(3,	300,	300,	'1\\1\\1_cb6db5a6.webp'),
(4,	1870,	2048,	'1\\1\\1\\1_472fdedc.webp'),
(5,	2128,	2016,	'1\\1\\2\\2_fbd0b7d9.webp'),
(6,	2048,	1024,	'1\\1\\1\\point_images\\1\\1_de30b999.webp'),
(7,	2048,	1024,	'1\\1\\1\\point_images\\2\\2_bfba4c27.webp'),
(8,	2048,	1024,	'1\\1\\1\\point_images\\3\\3_08d249f0.webp'),
(9,	2048,	1024,	'1\\1\\1\\point_images\\4\\4_ec0ed804.webp'),
(10,	2048,	1024,	'1\\1\\1\\point_images\\5\\5_8c0fd6d6.webp'),
(11,	2048,	1024,	'1\\1\\1\\point_images\\6\\6_90679ab1.webp'),
(12,	2048,	1024,	'1\\1\\1\\point_images\\7\\7_b0fd3820.webp'),
(13,	2048,	1024,	'1\\1\\1\\point_images\\8\\8_31f41c0b.webp'),
(14,	2048,	1024,	'1\\1\\1\\point_images\\9\\9_f9c425ae.webp'),
(15,	2048,	1024,	'1\\1\\1\\point_images\\10\\10_04c44646.webp'),
(16,	2048,	1024,	'1\\1\\1\\point_images\\11\\11_a696a0aa.webp'),
(17,	2048,	1024,	'1\\1\\1\\point_images\\12\\12_a1dceb41.webp'),
(18,	2048,	1024,	'1\\1\\1\\point_images\\13\\13_246c25ef.webp'),
(19,	2048,	1024,	'1\\1\\1\\point_images\\14\\14_44310f6a.webp'),
(20,	2048,	1024,	'1\\1\\1\\point_images\\15\\15_d6b0980c.webp'),
(21,	2048,	1024,	'1\\1\\1\\point_images\\16\\16_2210202e.webp'),
(22,	2048,	1024,	'1\\1\\2\\point_images\\17\\17_4e22ddf1.webp'),
(23,	2048,	1024,	'1\\1\\2\\point_images\\18\\18_04735f55.webp'),
(24,	2048,	1024,	'1\\1\\2\\point_images\\19\\19_f1f73c2a.webp'),
(25,	2048,	1024,	'1\\1\\2\\point_images\\20\\20_67573bdf.webp'),
(26,	2048,	1024,	'1\\1\\2\\point_images\\21\\21_1ff82494.webp'),
(27,	2048,	1024,	'1\\1\\2\\point_images\\22\\22_995ff556.webp'),
(28,	2048,	1024,	'1\\1\\2\\point_images\\23\\23_a265fddb.webp'),
(29,	2048,	1024,	'1\\1\\2\\point_images\\24\\24_391e038f.webp');

DROP TABLE IF EXISTS `log`;
CREATE TABLE `log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `victim_id` int DEFAULT NULL,
  `activity` varchar(50) COLLATE utf8mb3_hungarian_ci DEFAULT NULL,
  `happened_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  KEY `victim_id` (`victim_id`),
  CONSTRAINT `log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `log_ibfk_2` FOREIGN KEY (`victim_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `log` (`log_id`, `user_id`, `victim_id`, `activity`, `happened_at`) VALUES
(1,	1,	NULL,	'Sign up',	'2026-05-04 20:08:19'),
(2,	1,	NULL,	'Login',	'2026-05-04 20:08:30'),
(3,	2,	NULL,	'Sign up',	'2026-05-04 20:57:47'),
(4,	3,	NULL,	'Sign up',	'2026-05-04 20:58:49'),
(5,	2,	NULL,	'Login',	'2026-05-04 20:59:33');

DROP TABLE IF EXISTS `map`;
CREATE TABLE `map` (
  `map_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(20) COLLATE utf8mb3_hungarian_ci NOT NULL,
  `game_maps_id` int NOT NULL,
  `image_id` int DEFAULT NULL,
  PRIMARY KEY (`map_id`),
  KEY `game_maps_id` (`game_maps_id`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `map_ibfk_1` FOREIGN KEY (`game_maps_id`) REFERENCES `game_maps` (`game_maps_id`) ON DELETE CASCADE,
  CONSTRAINT `map_ibfk_2` FOREIGN KEY (`image_id`) REFERENCES `images` (`image_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `map` (`map_id`, `title`, `game_maps_id`, `image_id`) VALUES
(1,	'alsó szint',	1,	4),
(2,	'felső szint',	1,	5);

DROP TABLE IF EXISTS `point_connections`;
CREATE TABLE `point_connections` (
  `connection_id` int NOT NULL AUTO_INCREMENT,
  `start_point_id` int NOT NULL,
  `end_point_id` int NOT NULL,
  `game_maps_id` int NOT NULL,
  `direction_start_to_end` decimal(5,2) DEFAULT NULL,
  `direction_end_to_start` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`connection_id`),
  UNIQUE KEY `unique_connection` (`game_maps_id`,`start_point_id`,`end_point_id`),
  KEY `start_point_id` (`start_point_id`),
  KEY `end_point_id` (`end_point_id`),
  CONSTRAINT `point_connections_ibfk_1` FOREIGN KEY (`start_point_id`) REFERENCES `points` (`point_id`) ON DELETE CASCADE,
  CONSTRAINT `point_connections_ibfk_2` FOREIGN KEY (`end_point_id`) REFERENCES `points` (`point_id`) ON DELETE CASCADE,
  CONSTRAINT `point_connections_ibfk_3` FOREIGN KEY (`game_maps_id`) REFERENCES `game_maps` (`game_maps_id`) ON DELETE CASCADE,
  CONSTRAINT `check_different_points` CHECK ((`start_point_id` <> `end_point_id`)),
  CONSTRAINT `check_direction_e2s` CHECK (((`direction_end_to_start` >= 0) and (`direction_end_to_start` < 360))),
  CONSTRAINT `check_direction_s2e` CHECK (((`direction_start_to_end` >= 0) and (`direction_start_to_end` < 360))),
  CONSTRAINT `check_point_order` CHECK ((`start_point_id` < `end_point_id`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `point_connections` (`connection_id`, `start_point_id`, `end_point_id`, `game_maps_id`, `direction_start_to_end`, `direction_end_to_start`) VALUES
(1,	1,	2,	1,	NULL,	NULL),
(2,	2,	3,	1,	NULL,	NULL),
(3,	3,	4,	1,	NULL,	NULL),
(4,	3,	5,	1,	NULL,	NULL),
(5,	3,	6,	1,	NULL,	NULL),
(6,	2,	7,	1,	NULL,	NULL),
(7,	7,	8,	1,	NULL,	NULL),
(8,	7,	9,	1,	NULL,	NULL),
(9,	9,	10,	1,	NULL,	NULL),
(10,	10,	11,	1,	NULL,	NULL),
(11,	9,	12,	1,	NULL,	NULL),
(12,	12,	13,	1,	NULL,	NULL),
(13,	12,	14,	1,	NULL,	NULL),
(14,	13,	14,	1,	NULL,	NULL),
(15,	7,	15,	1,	NULL,	NULL),
(16,	9,	15,	1,	NULL,	NULL),
(17,	2,	16,	1,	NULL,	NULL),
(18,	16,	17,	1,	0.00,	256.67),
(19,	17,	18,	1,	NULL,	NULL),
(20,	18,	19,	1,	NULL,	NULL),
(21,	19,	20,	1,	NULL,	NULL),
(22,	19,	21,	1,	NULL,	NULL),
(23,	20,	21,	1,	NULL,	NULL),
(24,	17,	21,	1,	NULL,	NULL),
(25,	21,	22,	1,	NULL,	NULL),
(26,	20,	22,	1,	NULL,	NULL),
(27,	21,	23,	1,	NULL,	NULL),
(28,	22,	23,	1,	NULL,	NULL),
(29,	17,	24,	1,	NULL,	NULL),
(30,	21,	24,	1,	NULL,	NULL),
(31,	23,	24,	1,	NULL,	NULL);

DROP TABLE IF EXISTS `points`;
CREATE TABLE `points` (
  `point_id` int NOT NULL AUTO_INCREMENT,
  `map_id` int NOT NULL,
  `point_u` float NOT NULL,
  `point_v` float NOT NULL,
  `north_direction` decimal(5,2) NOT NULL DEFAULT '0.00',
  `image_id` int DEFAULT NULL,
  PRIMARY KEY (`point_id`),
  UNIQUE KEY `unique_point_coordinates_per_map` (`map_id`,`point_u`,`point_v`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `points_ibfk_1` FOREIGN KEY (`map_id`) REFERENCES `map` (`map_id`) ON DELETE CASCADE,
  CONSTRAINT `points_ibfk_2` FOREIGN KEY (`image_id`) REFERENCES `images` (`image_id`) ON DELETE SET NULL,
  CONSTRAINT `check_north_direction` CHECK (((`north_direction` >= 0) and (`north_direction` < 360))),
  CONSTRAINT `check_point_u_range` CHECK (((`point_u` >= 0) and (`point_u` < 1))),
  CONSTRAINT `check_point_v_range` CHECK (((`point_v` >= 0) and (`point_v` < 1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `points` (`point_id`, `map_id`, `point_u`, `point_v`, `north_direction`, `image_id`) VALUES
(1,	1,	0.0767349,	0.945743,	66.25,	6),
(2,	1,	0.231231,	0.691987,	199.77,	7),
(3,	1,	0.408582,	0.617696,	188.32,	8),
(4,	1,	0.787097,	0.785475,	15.43,	9),
(5,	1,	0.781532,	0.478039,	18.57,	10),
(6,	1,	0.336979,	0.50668,	49.09,	11),
(7,	1,	0.250834,	0.327536,	22.38,	12),
(8,	1,	0.187963,	0.345577,	85.33,	13),
(9,	1,	0.315229,	0.248129,	0.00,	14),
(10,	1,	0.370995,	0.133354,	0.00,	15),
(11,	1,	0.451355,	0.0854678,	0.00,	16),
(12,	1,	0.568197,	0.249736,	358.08,	17),
(13,	1,	0.686366,	0.093954,	159.71,	18),
(14,	1,	0.570009,	0.163606,	92.96,	19),
(15,	1,	0.378938,	0.355591,	125.38,	20),
(16,	1,	0.122044,	0.609348,	20.47,	21),
(17,	2,	0.241164,	0.550082,	33.83,	22),
(18,	2,	0.186956,	0.707848,	272.25,	23),
(19,	2,	0.470813,	0.727879,	5.22,	24),
(20,	2,	0.753126,	0.418196,	56.72,	25),
(21,	2,	0.558591,	0.454091,	121.57,	26),
(22,	2,	0.554478,	0.139238,	213.12,	27),
(23,	2,	0.33875,	0.13773,	289.42,	28),
(24,	2,	0.179176,	0.242071,	211.21,	29);

DROP TABLE IF EXISTS `session_guesses`;
CREATE TABLE `session_guesses` (
  `guess_id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `point_id` int DEFAULT NULL,
  `round` int NOT NULL,
  `map_id` int DEFAULT NULL,
  `guessed_u` float NOT NULL,
  `guessed_v` float NOT NULL,
  `points_awarded` int NOT NULL,
  `guessed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cycle` int NOT NULL,
  PRIMARY KEY (`guess_id`),
  KEY `map_id` (`map_id`),
  KEY `session_id` (`session_id`),
  KEY `point_id` (`point_id`),
  CONSTRAINT `session_guesses_ibfk_1` FOREIGN KEY (`map_id`) REFERENCES `map` (`map_id`) ON DELETE CASCADE,
  CONSTRAINT `session_guesses_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `session_guesses_ibfk_3` FOREIGN KEY (`point_id`) REFERENCES `points` (`point_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `session_guesses` (`guess_id`, `session_id`, `point_id`, `round`, `map_id`, `guessed_u`, `guessed_v`, `points_awarded`, `guessed_at`, `cycle`) VALUES
(1,	1,	4,	1,	1,	0.817649,	0.72701,	4754,	'2026-05-04 20:56:21',	1),
(2,	1,	12,	2,	1,	0.586191,	0.258164,	4998,	'2026-05-04 20:56:31',	1),
(3,	1,	18,	3,	2,	0.20294,	0.70844,	5000,	'2026-05-04 20:56:39',	1),
(4,	1,	2,	4,	1,	0.193841,	0.679528,	4952,	'2026-05-04 20:56:48',	1),
(5,	1,	1,	5,	1,	0.0858124,	0.926127,	4994,	'2026-05-04 20:56:57',	1);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `email` varchar(254) COLLATE utf8mb3_hungarian_ci NOT NULL,
  `password` varchar(60) COLLATE utf8mb3_hungarian_ci NOT NULL,
  `role` varchar(5) COLLATE utf8mb3_hungarian_ci DEFAULT 'user',
  `pfp` int DEFAULT NULL,
  `language` varchar(5) COLLATE utf8mb3_hungarian_ci DEFAULT 'hu',
  `darkmode` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `pfp` (`pfp`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`pfp`) REFERENCES `images` (`image_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_hungarian_ci;

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `role`, `pfp`, `language`, `darkmode`, `created_at`, `deleted_at`) VALUES
(1,	'user',	'user@lokea.com',	'$2b$10$K9QDKYvzcYOaV2EMk1bjB.eBPyHkxFU3OC5iEeidBTdWaI2Hmn8vy',	'user',	NULL,	'hu',	0,	'2026-05-04 20:08:19',	NULL),
(2,	'admin',	'admin@lokea.com',	'$2b$10$.tHwWLGoW5gW/71ZFk0l6eKk/MiRiYSVHCR34IEkTAEJ.cJibPDmS',	'ADMIN',	NULL,	'hu',	0,	'2026-05-04 20:57:47',	NULL),
(3,	'lord',	'lord@lokea.com',	'$2b$10$wFyB74JTRI5GjJAaHZUTu.l8xv6EUJqwlnU8rxB1ZIMgEgTGJ6Nwu',	'user',	NULL,	'hu',	0,	'2026-05-04 20:58:49',	NULL);

-- 2026-05-04 21:01:14 UTC