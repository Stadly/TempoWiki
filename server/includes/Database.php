<?php

Database::instantiate(DATABASE_HOST, DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD);

class Database {
	private static $instance;
	private static $transation;
	private static $host;
	private static $database;
	private static $username;
	private static $password;

	/**
	 * The constructor is set to private to make it impossible to create a new instance using new
	 */
	private function __construct() {}

	/**
	 * The clone-function is set to private to make it impossible to create a new instance by cloning
	 */
	private function __clone() {}

	/**
	 * Set up the database connection
	 */
	public static function instantiate($host, $database, $username, $password) {
		if(self::isInstantiated())
			throw new Exception('The database connection has already been instantiated.');
		
		self::$host = $host;
		self::$database = $database;
		self::$username = $username;
		self::$password = $password;

		self::$instance = new PDO("mysql:host=$host;dbname=$database", $username, $password);
		self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
	}

	/**
	 * Return whether the database connection has been instantiated or not
	 *
	 * @return boolean
	 */
	public static function isInstantiated() {
		return !is_null(self::$instance);
	}

	/**
	 * Throws an exception if the database connection has not been instantiated
	 */
	private static function assertInstantiated() {
		if(!self::isInstantiated())
			throw new Exception('The database connection has not been instantiated.');
	}

	/**
	 * Return database connection
	 *
	 * @return PDO
	 */
	public static function getInstance() {
		self::assertInstantiated();

		return self::$instance;
	}

	/**
	 * Close database connection
	 *
	 * @return PDO
	 */
	public static function close() {
		self::assertInstantiated();

		self::$instance = NULL;
	}

	public static function beginTransaction() {
		self::assertInstantiated();

		if(is_null(self::$transation) && !self::$instance->inTransaction())
			self::$instance->beginTransaction();
		self::$transation = new Transaction(self::$transation);
	}
	
	public static function commit() {
		self::assertInstantiated();

		if(!is_null(self::$transation))
			self::$transation = self::$transation->getParent();
		if(is_null(self::$transation) && self::$instance->inTransaction())
			self::$instance->commit();
	}
	
	public static function rollBack() {
		self::assertInstantiated();

		if(!is_null(self::$transation))
			self::$transation = self::$transation->getParent();
		if(is_null(self::$transation) && self::$instance->inTransaction())
			self::$instance->rollBack();
	}
}

class Transaction {
	private $parent;
	
	public function __construct($parent = NULL) {
		$this->parent = $parent;
	}
	
	public function getParent() {
		return $this->parent;
	}
}

?>
