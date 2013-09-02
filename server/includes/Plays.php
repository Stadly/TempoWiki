<?php

final class Plays {
	const TABLE_REG = 'tw_plays_reg';
	
	private function __construct() {}
	private function __clone() {}
	
	public static function register($track, $user, $played, $date) {
		require_once 'includes/Database.php';

		$db = Database::getInstance();
		$insert = $db->prepare('INSERT INTO '.self::TABLE_REG.' (track, played, user, date) VALUES (:track, :played, :user, :date)');
		$insert->execute(array(':track' => $track, ':played' => $played, ':user' => $user, ':date' => $date));
	}
}

?>