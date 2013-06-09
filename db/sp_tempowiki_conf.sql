-- phpMyAdmin SQL Dump
-- version 3.5.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 09, 2013 at 08:10 PM
-- Server version: 5.5.24-log
-- PHP Version: 5.4.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `sp_tempowiki`
--

--
-- Dumping data for table `tw_dancegenre_conf`
--

INSERT INTO `tw_dancegenre_conf` (`id`, `parent`, `name`, `short`, `order`) VALUES
(1, NULL, 'Swing', 'Sw', 1),
(2, 1, 'Boogie Woogie', 'BW', 1),
(3, 1, 'West Coast Swing', 'WCS', 2),
(4, 1, 'Lindy Hop', 'LH', 3),
(5, NULL, 'Standard', 'Std', 3),
(6, 5, 'Slow Waltz', 'SW', 1),
(7, 5, 'Viennese Waltz', 'VW', 3),
(8, 1, 'Charleston', 'C', 4),
(9, 1, 'Blues', 'Bl', 5),
(10, 1, 'Balboa', 'Bal', 6),
(11, 1, 'Bugg', 'Bu', 7),
(12, 1, 'Folkeswing', 'FS', 8),
(13, 5, 'Tango', 'Ta', 2),
(14, 5, 'Slowfox', 'SF', 4),
(15, 5, 'Quickstep', 'QS', 5),
(16, NULL, 'Latin', 'Lat', 4),
(17, 16, 'Samba', 'Sam', 1),
(18, 16, 'Cha-cha-cha', 'Cha', 2),
(19, 16, 'Rumba', 'Rum', 3),
(20, 16, 'Paso doble', 'PD', 4),
(21, 16, 'Jive', 'Jiv', 5),
(22, NULL, 'Salsa', 'Sa', 2),
(23, 22, 'Cuban salsa', 'CS', 1),
(24, 22, 'LA salsa', 'LA', 2),
(25, 22, 'NY salsa', 'NY', 3),
(26, 22, 'Bachata', 'Bac', 4),
(27, 22, 'Son', 'Son', 5);

--
-- Dumping data for table `tw_musicgenre_conf`
--

INSERT INTO `tw_musicgenre_conf` (`id`, `parent`, `name`, `short`, `order`) VALUES
(1, NULL, 'Blues', 'Bl', 1),
(2, NULL, 'Boogie Woogie', 'BW', 2),
(3, NULL, 'Country', 'Co', 3),
(4, NULL, 'Bluegrass', 'Blu', 4),
(5, NULL, 'Dance Band', 'DB', 5),
(6, NULL, 'Gospel', 'Go', 6),
(7, NULL, 'Hip Hop', 'HH', 7),
(8, NULL, 'Jazz', 'Ja', 8),
(9, NULL, 'Dixieland', 'Dx', 9),
(10, NULL, 'Neo Swing', 'NS', 10),
(11, NULL, 'Swing Jazz', 'SJ', 11),
(12, NULL, 'Pop', 'Pop', 12),
(13, NULL, 'R&B', 'R&B', 13),
(14, NULL, 'Disco', 'Di', 14),
(15, NULL, 'Soul', 'So', 15),
(16, NULL, 'Rock', 'Ro', 16),
(17, NULL, 'Rock & Roll', 'RR', 17),
(18, NULL, 'Rockabilly', 'Rb', 18),
(19, NULL, 'Soundtrack', 'St', 19);

--
-- Dumping data for table `tw_tempo_conf`
--

INSERT INTO `tw_tempo_conf` (`property`, `value`) VALUES
('rangeMin', 0),
('rangeMax', 400);

--
-- Dumping data for table `tw_tempo_conf_unit`
--

INSERT INTO `tw_tempo_conf_unit` (`id`, `name`, `unit`, `multiplier`, `order`) VALUES
(1, 'BPM', 'bpm', '1.00', 1),
(2, 'Bar', 'bar', '0.25', 2);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
