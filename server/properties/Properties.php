<?php

require_once 'properties/IProperty.php';

final class Properties implements IProperty {
	private static $properties = array
		( 'tempo' =>			array('properties/Tempo.php',			'Tempo')
		, 'dancegenres' =>	array('properties/Dancegenre.php',	'Dancegenre')
		, 'musicgenres' =>	array('properties/Musicgenre.php',	'Musicgenre')
		);
	
	private function __construct() {}
	private function __clone() {}
	
	private static function loadProperties(array $properties = NULL) {
		foreach(self::$properties as $name => $property)
			if(is_null($properties) || in_array($name, $properties))
				require_once $property[0];
	}
	
	public static function config() {
		self::loadProperties();
		$config = array();
		foreach(self::$properties as $name => $property)
			$config[$name] = $property[1]::config();
		
		return $config;
	}

	public static function fetch($track, $user) {
		$trackId = Track::get($track);
		$fetch = array('track' => $track, 'accu' => array(), 'reg' => array());
		if($trackId != 0) {
			self::loadProperties();
			foreach(self::$properties as $name => $property) {
				$propFetch = $property[1]::fetch($trackId, $user);
				if(!empty($propFetch['accu']))
					$fetch['accu'][$name] = $propFetch['accu'];
				if(!empty($propFetch['reg']))
					$fetch['reg'][$name] = $propFetch['reg'];
			}
		}
		return $fetch;
	}

	public static function playlist(array &$fields, array &$tables, array &$conditions, array &$ordering, $user, array $data) {
		self::loadProperties();
		foreach(self::$properties as $name => $property)
			$property[1]::playlist($fields, $tables, $conditions, $ordering, $user, empty($data[$name]) ? array() : json_decode($data[$name], TRUE));
	}

	public static function register($track, $user, array $data, $date) {
		$trackId = Track::register($track);
		$register = array('track' => $track, 'accu' => array(), 'reg' => array());
		if($trackId != 0) {
			self::loadProperties();
			foreach(self::$properties as $name => $property) {
				$propRegister = $property[1]::register($trackId, $user, empty($data[$name]) ? array() : json_decode($data[$name], TRUE), $date);
				if(!empty($propRegister['accu']))
					$register['accu'][$name] = $propRegister['accu'];
				if(!empty($propRegister['reg']))
					$register['reg'][$name] = $propRegister['reg'];
			}
		}
		return $register;
	}
	
	public static function managePlaylistRow($row) {
		$properties = array();
		self::loadProperties();
		foreach(self::$properties as $name => $property)
			$properties[$name] = $property[1]::managePlaylistRow($row);
		return $properties;
	}
	
	public static function profiles(array &$fields, array &$tables) {
		self::loadProperties();
		foreach(self::$properties as $property)
			$property[1]::profiles($fields, $tables);
	}
	
	public static function manageProfile($row) {
		$properties = array();
		self::loadProperties();
		foreach(self::$properties as $name => $property)
			$properties[$name] = $property[1]::manageProfile($row);
		return $properties;
	}
	
	public static function profilerEdit($profile, array $data) {
		self::loadProperties();
		foreach(self::$properties as $name => $property)
			$property[1]::profilerEdit($profile, empty($data[$name]) ? array() : json_decode($data[$name], TRUE));
	}
	
	public static function profilerDelete($profile) {
		self::loadProperties();
		foreach(self::$properties as $property)
			$property[1]::profilerDelete($profile);
	}
}

?>
