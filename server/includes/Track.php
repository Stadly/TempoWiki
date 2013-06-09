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
		$select = $db->prepare('SELECT track FROM '.self::TABLE.' WHERE spotify = (:spotify)');
		if($select->execute(array('spotify' => $spotify)) && $select->rowCount() > 0)
			return $select->fetch()->track;
		
		return 0;
	}
}

?>