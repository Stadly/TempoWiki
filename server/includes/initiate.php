<?php

session_start();
session_cache_limiter('nocache');

define('DEVELOP_MODE', strpos($_SERVER['HTTP_HOST'], 'tempowiki.com') !== FALSE);
define('DATABASE_HOST', DEVELOP_MODE ? 'localhost' : 'myrtveitfoto.no.mysql');
define('DATABASE_NAME', DEVELOP_MODE ? 'sp_tempowiki' : 'myrtveitfoto_no');
define('DATABASE_USERNAME', DEVELOP_MODE ? 'root' : 'myrtveitfoto_no');
define('DATABASE_PASSWORD', DEVELOP_MODE ? '' : 'oJTF2MB1');

?>
