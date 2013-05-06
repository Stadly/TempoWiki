<?php

class DanceGenre {
	const TABLE = 'tw_reg_dancegenre';
	const STAT_TABLE = 'tw_stat_dancegenre';
	const STAT_USER_TABLE = 'tw_stat_dancegenre_user';
	
	public static function register($track, $user, array $post, $date) {
		$danceGenres = empty($post['dance-genres']) ? array() : json_decode($post['dance-genres'], TRUE);
		
		if(!empty($danceGenres)) {
			require_once 'includes/Database.php';
			
			$db = Database::getInstance();
			$insert = $db->prepare('INSERT INTO '.self::TABLE.' (track, dancegenre, value, user, date) VALUES '.implode(', ', array_fill(0, count($danceGenres), '(?, ?, ?, ?, ?)')).' ON DUPLICATE KEY UPDATE value = VALUES(value), date = VALUES(date)');
			$values = array();
			foreach($danceGenres as $danceGenre => $value)
				$values = array_merge($values, array($track, $danceGenre, min(max($value, -1), 1), $user, $date));
			$insert->execute($values);
		}
		
		return self::fetch($track, $user);
	}
	
	public static function fetch($track, $user) {
		require_once 'includes/Database.php';
		
		$db = Database::getInstance();
		$select = $db->prepare('SELECT s.dancegenre, IFNULL(value, votes/total) value FROM '.self::STAT_TABLE.' s LEFT JOIN '.self::TABLE.' r ON (s.track = r.track AND s.dancegenre = r.dancegenre AND r.user = :user) WHERE s.track = :track AND ROUND(IFNULL(value, votes/total)) != 0');
		if($select->execute(array(':track' => $track, ':user' => $user)))
			return $select->fetchAll(PDO::FETCH_KEY_PAIR);
		
		return array();
	}
	
	public static function playlist(array &$fields, array &$tables, array &$conditions, array &$ordering, $user, array $post) {
		$danceGenres = empty($post['dance-genres']) ? array() : json_decode($post['dance-genres'], TRUE);
		
		$tableAlias = 'd';
		$include = array();
		$exclude = array();
		foreach($danceGenres as $danceGenre => $value) {
			if($value == 1)
				$include[] = $danceGenre;
			elseif($value == -1)
				$exclude[] = $danceGenre;
		}
		if(!empty($include))
			$conditions[] = 't.track IN (SELECT track FROM '.self::STAT_USER_TABLE." WHERE user = $user AND dancegenre IN (".implode(', ', $include).'))';
		if(!empty($exclude))
			$conditions[] = 't.track NOT IN (SELECT track FROM '.self::STAT_USER_TABLE." WHERE user = $user AND dancegenre IN (".implode(', ', $exclude).'))';
		$fields[] = "GROUP_CONCAT($tableAlias.dancegenre) dancegenres";
		$tables[] = array(self::STAT_USER_TABLE, $tableAlias, array("$tableAlias.user = $user"));
		$ordering[] = "SUM($tableAlias.value)";
	}
}

?>