-- phpMyAdmin SQL Dump
-- version 3.5.8.1
-- http://www.phpmyadmin.net
--
-- Host: 10.246.16.134:3306
-- Generation Time: Aug 24, 2013 at 10:49 AM
-- Server version: 5.1.66-0+squeeze1
-- PHP Version: 5.3.3-7+squeeze15

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `myrtveitfoto_no`
--

-- --------------------------------------------------------

--
-- Stand-in structure for view `tw_dancegenre_accu`
--
CREATE TABLE IF NOT EXISTS `tw_dancegenre_accu` (
`track` int(11) unsigned
,`genre` int(11) unsigned
,`votes` decimal(32,0)
,`total` bigint(21)
);
-- --------------------------------------------------------

--
-- Stand-in structure for view `tw_dancegenre_accu_user`
--
CREATE TABLE IF NOT EXISTS `tw_dancegenre_accu_user` (
`track` int(11) unsigned
,`genre` int(11) unsigned
,`user` int(11) unsigned
,`value` decimal(36,4)
);
-- --------------------------------------------------------

--
-- Table structure for table `tw_dancegenre_conf`
--

CREATE TABLE IF NOT EXISTS `tw_dancegenre_conf` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(11) unsigned DEFAULT NULL,
  `name` varchar(50) COLLATE utf8_swedish_ci NOT NULL,
  `short` varchar(10) COLLATE utf8_swedish_ci NOT NULL,
  `order` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_dancegenre_reg`
--

CREATE TABLE IF NOT EXISTS `tw_dancegenre_reg` (
  `track` int(11) unsigned NOT NULL,
  `genre` int(11) unsigned NOT NULL,
  `value` int(11) NOT NULL,
  `user` int(11) unsigned NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`track`,`genre`,`user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `tw_musicgenre_accu`
--
CREATE TABLE IF NOT EXISTS `tw_musicgenre_accu` (
`track` int(11) unsigned
,`genre` int(11) unsigned
,`votes` decimal(32,0)
,`total` bigint(21)
);
-- --------------------------------------------------------

--
-- Stand-in structure for view `tw_musicgenre_accu_user`
--
CREATE TABLE IF NOT EXISTS `tw_musicgenre_accu_user` (
`track` int(11) unsigned
,`genre` int(11) unsigned
,`user` int(11) unsigned
,`value` decimal(36,4)
);
-- --------------------------------------------------------

--
-- Table structure for table `tw_musicgenre_conf`
--

CREATE TABLE IF NOT EXISTS `tw_musicgenre_conf` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(11) unsigned DEFAULT NULL,
  `name` varchar(50) COLLATE utf8_swedish_ci NOT NULL,
  `short` varchar(10) COLLATE utf8_swedish_ci NOT NULL,
  `order` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_musicgenre_reg`
--

CREATE TABLE IF NOT EXISTS `tw_musicgenre_reg` (
  `track` int(11) unsigned NOT NULL,
  `genre` int(11) unsigned NOT NULL,
  `value` int(11) NOT NULL,
  `user` int(11) unsigned NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`track`,`genre`,`user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_plays_reg`
--

CREATE TABLE IF NOT EXISTS `tw_plays_reg` (
  `track` int(11) unsigned NOT NULL,
  `played` decimal(20,20) unsigned NOT NULL,
  `user` int(11) unsigned NOT NULL,
  `date` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_profile`
--

CREATE TABLE IF NOT EXISTS `tw_profile` (
  `profile` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_swedish_ci NOT NULL,
  `user` int(11) unsigned NOT NULL,
  `active` tinyint(1) unsigned NOT NULL,
  PRIMARY KEY (`profile`),
  KEY `user` (`user`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_profile_dancegenre`
--

CREATE TABLE IF NOT EXISTS `tw_profile_dancegenre` (
  `profile` int(11) unsigned NOT NULL,
  `genre` int(11) unsigned NOT NULL,
  UNIQUE KEY `unique` (`profile`,`genre`),
  KEY `profile` (`profile`),
  KEY `dancegenre` (`genre`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_profile_musicgenre`
--

CREATE TABLE IF NOT EXISTS `tw_profile_musicgenre` (
  `profile` int(11) unsigned NOT NULL,
  `genre` int(11) unsigned NOT NULL,
  UNIQUE KEY `unique` (`profile`,`genre`),
  KEY `profile` (`profile`),
  KEY `musicgenre` (`genre`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_profile_tempo`
--

CREATE TABLE IF NOT EXISTS `tw_profile_tempo` (
  `profile` int(11) unsigned NOT NULL,
  `min` int(4) unsigned DEFAULT NULL,
  `max` int(4) unsigned DEFAULT NULL,
  PRIMARY KEY (`profile`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_profile_tempo_unit`
--

CREATE TABLE IF NOT EXISTS `tw_profile_tempo_unit` (
  `profile` int(11) unsigned NOT NULL,
  `unit` int(11) unsigned NOT NULL,
  `default` tinyint(1) unsigned NOT NULL,
  UNIQUE KEY `unique` (`profile`,`unit`),
  KEY `profile` (`profile`),
  KEY `unit` (`unit`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `tw_tempo_accu`
--
CREATE TABLE IF NOT EXISTS `tw_tempo_accu` (
`track` int(11) unsigned
,`tempo` double unsigned
,`votes` bigint(21)
,`total` bigint(21)
);
-- --------------------------------------------------------

--
-- Table structure for table `tw_tempo_conf`
--

CREATE TABLE IF NOT EXISTS `tw_tempo_conf` (
  `property` varchar(255) COLLATE utf8_swedish_ci NOT NULL,
  `value` int(11) NOT NULL,
  PRIMARY KEY (`property`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_tempo_conf_unit`
--

CREATE TABLE IF NOT EXISTS `tw_tempo_conf_unit` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_swedish_ci NOT NULL,
  `unit` varchar(50) COLLATE utf8_swedish_ci NOT NULL,
  `multiplier` decimal(10,2) NOT NULL,
  `order` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `unit` (`unit`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_tempo_reg`
--

CREATE TABLE IF NOT EXISTS `tw_tempo_reg` (
  `track` int(11) unsigned NOT NULL,
  `tempo` double unsigned NOT NULL,
  `user` int(11) unsigned NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`track`,`user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_tracks`
--

CREATE TABLE IF NOT EXISTS `tw_tracks` (
  `track` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `spotify` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`track`),
  UNIQUE KEY `spotify` (`spotify`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tw_users`
--

CREATE TABLE IF NOT EXISTS `tw_users` (
  `user` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `identifier` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`user`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `identifier` (`identifier`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Structure for view `tw_dancegenre_accu`
--
DROP TABLE IF EXISTS `tw_dancegenre_accu`;

CREATE ALGORITHM=UNDEFINED DEFINER=`myrtveitfoto_no`@`%` SQL SECURITY DEFINER VIEW `tw_dancegenre_accu` AS select `tw_dancegenre_reg`.`track` AS `track`,`tw_dancegenre_reg`.`genre` AS `genre`,sum(`tw_dancegenre_reg`.`value`) AS `votes`,count(0) AS `total` from `tw_dancegenre_reg` group by `tw_dancegenre_reg`.`track`,`tw_dancegenre_reg`.`genre`;

-- --------------------------------------------------------

--
-- Structure for view `tw_dancegenre_accu_user`
--
DROP TABLE IF EXISTS `tw_dancegenre_accu_user`;

CREATE ALGORITHM=UNDEFINED DEFINER=`myrtveitfoto_no`@`%` SQL SECURITY DEFINER VIEW `tw_dancegenre_accu_user` AS select `dc`.`track` AS `track`,`dc`.`genre` AS `genre`,`u`.`user` AS `user`,if((ifnull(`dr`.`value`,0) = 0),(`dc`.`votes` / `dc`.`total`),`dr`.`value`) AS `value` from ((`tw_dancegenre_accu` `dc` join `tw_users` `u`) left join `tw_dancegenre_reg` `dr` on(((`dc`.`track` = `dr`.`track`) and (`dc`.`genre` = `dr`.`genre`) and (`u`.`user` = `dr`.`user`)))) where (if((ifnull(`dr`.`value`,0) = 0),(`dc`.`votes` / `dc`.`total`),`dr`.`value`) >= 0.5);

-- --------------------------------------------------------

--
-- Structure for view `tw_musicgenre_accu`
--
DROP TABLE IF EXISTS `tw_musicgenre_accu`;

CREATE ALGORITHM=UNDEFINED DEFINER=`myrtveitfoto_no`@`%` SQL SECURITY DEFINER VIEW `tw_musicgenre_accu` AS select `tw_musicgenre_reg`.`track` AS `track`,`tw_musicgenre_reg`.`genre` AS `genre`,sum(`tw_musicgenre_reg`.`value`) AS `votes`,count(0) AS `total` from `tw_musicgenre_reg` group by `tw_musicgenre_reg`.`track`,`tw_musicgenre_reg`.`genre`;

-- --------------------------------------------------------

--
-- Structure for view `tw_musicgenre_accu_user`
--
DROP TABLE IF EXISTS `tw_musicgenre_accu_user`;

CREATE ALGORITHM=UNDEFINED DEFINER=`myrtveitfoto_no`@`%` SQL SECURITY DEFINER VIEW `tw_musicgenre_accu_user` AS select `dc`.`track` AS `track`,`dc`.`genre` AS `genre`,`u`.`user` AS `user`,if((ifnull(`dr`.`value`,0) = 0),(`dc`.`votes` / `dc`.`total`),`dr`.`value`) AS `value` from ((`tw_musicgenre_accu` `dc` join `tw_users` `u`) left join `tw_musicgenre_reg` `dr` on(((`dc`.`track` = `dr`.`track`) and (`dc`.`genre` = `dr`.`genre`) and (`u`.`user` = `dr`.`user`)))) where (if((ifnull(`dr`.`value`,0) = 0),(`dc`.`votes` / `dc`.`total`),`dr`.`value`) >= 0.5);

-- --------------------------------------------------------

--
-- Structure for view `tw_tempo_accu`
--
DROP TABLE IF EXISTS `tw_tempo_accu`;

CREATE ALGORITHM=UNDEFINED DEFINER=`myrtveitfoto_no`@`%` SQL SECURITY DEFINER VIEW `tw_tempo_accu` AS select `r`.`track` AS `track`,`r`.`tempo` AS `tempo`,count(0) AS `votes`,(select count(0) from `tw_tempo_reg` `a` where (`a`.`track` = `r`.`track`)) AS `total` from `tw_tempo_reg` `r` group by `r`.`track`,`r`.`tempo`;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
