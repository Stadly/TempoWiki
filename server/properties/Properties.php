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
		$fetch = array('track' => $track);
		if($trackId != 0) {
			self::loadProperties();
			foreach(self::$properties as $name => $property) {
				$propFetch = $property[1]::fetch($trackId, $user);
				if(!empty($propFetch))
					$fetch[$name] = $propFetch;
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
		$register = array('track' => $track);
		if($trackId != 0) {
			self::loadProperties();
			foreach(self::$properties as $name => $property) {
				$propRegister = $property[1]::register($trackId, $user, empty($data[$name]) ? array() : json_decode($data[$name], TRUE), $date);
				if(!empty($propRegister))
					$register[$name] = $propRegister;
			}
		}
		return $register;
	}
	
	public static function profiles(array &$fields, array &$tables) {
		self::loadProperties();
		foreach(self::$properties as $property)
			$property[1]::profiles($fields, $tables);
	}
	
	public static function profiler($profile, array $data) {
		self::loadProperties();
		foreach(self::$properties as $name => $property)
			$property[1]::profiler($profile, empty($data[$name]) ? array() : json_decode($data[$name], TRUE));
	}
	
	public static function profilerDelete($profile) {
		self::loadProperties();
		foreach(self::$properties as $property)
			$property[1]::profilerDelete($profile);
	}
}

?>
