<?php

Database::instantiate(DATABASE_HOST, DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD);

final class Database {
	private static $instance;
	private static $host;
	private static $database;
	private static $username;
	private static $password;

	private function __construct() {}
	private function __clone() {}

	public static function instantiate($host, $database, $username, $password) {
		if(self::isInstantiated())
			throw new Exception('The database connection has already been instantiated.');
		
		self::$host = $host;
		self::$database = $database;
		self::$username = $username;
		self::$password = $password;

		self::$instance = new PDO("mysql:host=$host;dbname=$database", $username, $password);
		self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
		self::$instance->exec('SET SQL_BIG_SELECTS = 1');
	}

	public static function isInstantiated() {
		return !is_null(self::$instance);
	}

	private static function assertInstantiated() {
		if(!self::isInstantiated())
			throw new Exception('The database connection has not been instantiated.');
	}

	public static function getInstance() {
		self::assertInstantiated();

		return self::$instance;
	}

	public static function close() {
		self::assertInstantiated();

		self::$instance = NULL;
	}
}

?>
