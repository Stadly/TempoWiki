<?php

class Track {
	const TABLE = 'tw_tracks';
	
	public static function register($spotify) {
		require_once 'includes/Database.php';

		$db = Database::getInstance();
		$insert = $db->prepare('INSERT INTO '.self::TABLE.' (spotify) VALUES (:spotify) ON DUPLICATE KEY UPDATE spotify = VALUES(spotify), track = LAST_INSERT_ID(track)');
		if($insert->execute(array('spotify' => $spotify)))
			return $db->lastInsertId();
		
		return 0;
	}
	
	public static function get($spotify) {
		require_once 'includes/Database.php';

		$db = Database::getInstance();
		$insert = $db->prepare('SELECT track FROM '.self::TABLE.' WHERE spotify = (:spotify)');
		if($insert->execute(array('spotify' => $spotify)) && $insert->rowCount() > 0)
			return $insert->fetch()->track;
		
		return 0;
	}
}

?>