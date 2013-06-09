<?php

class Config {
	public static function get() {
		require_once 'includes/Tempo.php';
		require_once 'includes/Dancegenre.php';
		require_once 'includes/Musicgenre.php';
		
		$config = array();
		$config['tempo'] = Tempo::config();
		$config['dancegenres'] = Dancegenre::config();
		$config['musicgenres'] = Musicgenre::config();
		
		return $config;
	}
}

?>
