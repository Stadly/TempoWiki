<?php

class Plays {
	const TABLE_REG = 'tw_plays_reg';
	
	public static function register($track, $played, $user, $date) {
		require_once 'includes/Database.php';

		$db = Database::getInstance();
		$insert = $db->prepare('INSERT INTO '.self::TABLE_REG.' (track, played, user, date) VALUES (:track, :played, :user, :date)');
		$insert->execute(array(':track' => $track, ':played' => $played, ':user' => $user, ':date' => $date));
	}
}

?>