-- phpMyAdmin SQL Dump
-- version 3.5.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 06, 2013 at 08:23 PM
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

-- --------------------------------------------------------

--
-- Table structure for table `tw_reg_bpm`
--

CREATE TABLE IF NOT EXISTS `tw_reg_bpm` (
  `track` int(11) NOT NULL,
  `bpm` double NOT NULL,
  `user` int(11) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`track`,`user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_reg_dancegenre`
--

CREATE TABLE IF NOT EXISTS `tw_reg_dancegenre` (
  `track` int(11) NOT NULL,
  `dancegenre` int(11) NOT NULL,
  `value` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`track`,`dancegenre`,`user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `tw_stat_bpm`
--
CREATE TABLE IF NOT EXISTS `tw_stat_bpm` (
`track` int(11)
,`bpm` double
,`votes` bigint(21)
,`total` bigint(21)
);
-- --------------------------------------------------------

--
-- Stand-in structure for view `tw_stat_dancegenre`
--
CREATE TABLE IF NOT EXISTS `tw_stat_dancegenre` (
`track` int(11)
,`dancegenre` int(11)
,`votes` decimal(32,0)
,`total` bigint(21)
);
-- --------------------------------------------------------

--
-- Stand-in structure for view `tw_stat_dancegenre_user`
--
CREATE TABLE IF NOT EXISTS `tw_stat_dancegenre_user` (
`track` int(11)
,`dancegenre` int(11)
,`user` int(11)
,`value` decimal(36,4)
);
-- --------------------------------------------------------

--
-- Table structure for table `tw_tracks`
--

CREATE TABLE IF NOT EXISTS `tw_tracks` (
  `track` int(11) NOT NULL AUTO_INCREMENT,
  `spotify` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`track`),
  UNIQUE KEY `spotifyId` (`spotify`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_users`
--

CREATE TABLE IF NOT EXISTS `tw_users` (
  `user` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `identifier` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`user`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Structure for view `tw_stat_bpm`
--
DROP TABLE IF EXISTS `tw_stat_bpm`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tw_stat_bpm` AS select `r`.`track` AS `track`,`r`.`bpm` AS `bpm`,count(0) AS `votes`,(select count(0) from `tw_reg_bpm` `a` where (`a`.`track` = `r`.`track`)) AS `total` from `tw_reg_bpm` `r` group by `r`.`track`,`r`.`bpm`;

-- --------------------------------------------------------

--
-- Structure for view `tw_stat_dancegenre`
--
DROP TABLE IF EXISTS `tw_stat_dancegenre`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tw_stat_dancegenre` AS select `tw_reg_dancegenre`.`track` AS `track`,`tw_reg_dancegenre`.`dancegenre` AS `dancegenre`,sum(`tw_reg_dancegenre`.`value`) AS `votes`,count(0) AS `total` from `tw_reg_dancegenre` group by `tw_reg_dancegenre`.`track`,`tw_reg_dancegenre`.`dancegenre`;

-- --------------------------------------------------------

--
-- Structure for view `tw_stat_dancegenre_user`
--
DROP TABLE IF EXISTS `tw_stat_dancegenre_user`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tw_stat_dancegenre_user` AS select `dc`.`track` AS `track`,`dc`.`dancegenre` AS `dancegenre`,`u`.`user` AS `user`,if((ifnull(`dr`.`value`,0) = 0),(`dc`.`votes` / `dc`.`total`),`dr`.`value`) AS `value` from ((`tw_stat_dancegenre` `dc` join `tw_users` `u`) left join `tw_reg_dancegenre` `dr` on(((`dc`.`track` = `dr`.`track`) and (`dc`.`dancegenre` = `dr`.`dancegenre`) and (`u`.`user` = `dr`.`user`)))) where (if((ifnull(`dr`.`value`,0) = 0),(`dc`.`votes` / `dc`.`total`),`dr`.`value`) >= 0.5);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
