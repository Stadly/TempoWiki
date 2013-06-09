<?php

abstract class Genre {
	const FIELD_PREFIX = '';
	const TABLE_CONF = 'tw_genre_conf';
	const TABLE_REG = 'tw_genre_reg';
	const TABLE_STAT = 'tw_genre_stat';
	const TABLE_STAT_USER = 'tw_genre_stat_user';
	
	public static function config() {
		require_once 'includes/Database.php';
		
		$db = Database::getInstance();
		$select = $db->prepare('SELECT id, parent, name, short FROM '.static::TABLE_CONF.' ORDER BY parent IS NULL DESC, parent, `order`');
		$genresFlat = array();
		$genres = array();
		if($select->execute()) {
			while($genre = $select->fetch()) {
				$genresFlat[$genre->id] = array(intval($genre->id), $genre->name, $genre->short, array());
				if(isset($genre->parent))
					$genresFlat[$genre->parent][3][] = &$genresFlat[$genre->id];
				else
					$genres[] = &$genresFlat[$genre->id];
			}
		}
		
		return $genres;
	}
	
	public static function register($track, $user, array $genres, $date) {
		if(!empty($genres)) {
			require_once 'includes/Database.php';
			
			$db = Database::getInstance();
			$insert = $db->prepare('INSERT INTO '.static::TABLE_REG.' (track, genre, value, user, date) VALUES '.implode(', ', array_fill(0, count($genres), '(?, ?, ?, ?, ?)')).' ON DUPLICATE KEY UPDATE value = VALUES(value), date = VALUES(date)');
			$values = array();
			foreach($genres as $genre => $value)
				$values = array_merge($values, array($track, $genre, min(max($value, -1), 1), $user, $date));
			$insert->execute($values);
		}
		
		return static::fetch($track, $user);
	}
	
	public static function fetch($track, $user) {
		require_once 'includes/Database.php';
		
		$db = Database::getInstance();
		$select = $db->prepare('SELECT s.genre, IFNULL(value, votes/total) value FROM '.static::TABLE_STAT.' s LEFT JOIN '.static::TABLE_REG.' r ON (s.track = r.track AND s.genre = r.genre AND r.user = :user) WHERE s.track = :track AND ROUND(IFNULL(value, votes/total)) != 0');
		if($select->execute(array(':track' => $track, ':user' => $user)))
			return $select->fetchAll(PDO::FETCH_KEY_PAIR);
		
		return array();
	}
	
	public static function playlist(array &$fields, array &$tables, array &$conditions, array &$ordering, $user, array $genres) {
		$include = array();
		$exclude = array();
		foreach($genres as $genre => $value) {
			if($value == 1)
				$include[] = $genre;
			elseif($value == -1)
				$exclude[] = $genre;
		}
		if(!empty($include))
			$conditions[] = 't.track IN (SELECT track FROM '.static::TABLE_STAT_USER." WHERE user = $user AND genre IN (".implode(', ', $include).'))';
		if(!empty($exclude))
			$conditions[] = 't.track NOT IN (SELECT track FROM '.static::TABLE_STAT_USER." WHERE user = $user AND genre IN (".implode(', ', $exclude).'))';
		$fields[] = 'GROUP_CONCAT('.static::TABLE_STAT_USER.'.genre) '.static::FIELD_PREFIX.'genres';
		$tables[] = array(static::TABLE_STAT_USER, array(static::TABLE_STAT_USER.".user = $user"));
		$ordering[] = 'SUM('.static::TABLE_STAT_USER.'.value)';
	}
}

?>