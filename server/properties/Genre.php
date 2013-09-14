<?php

require_once 'properties/IProperty.php';

abstract class Genre implements IProperty {
	const FIELD_PREFIX = '';
	const TABLE_CONF = 'tw_genre_conf';
	const TABLE_REG = 'tw_genre_reg';
	const TABLE_ACCU = 'tw_genre_accu';
	const TABLE_ACCU_USER = 'tw_genre_accu_user';
	const TABLE_PROFILER = 'tw_profile_genre';
	
	private function __construct() {}
	private function __clone() {}
	
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
	
	public static function register($track, $user, array $data, $date) {
		if(!empty($data)) {
			require_once 'includes/Database.php';
			
			$db = Database::getInstance();
			$insert = $db->prepare('INSERT INTO '.static::TABLE_REG.' (track, genre, value, user, date) VALUES '.implode(', ', array_fill(0, count($data), '(?, ?, ?, ?, ?)')).' ON DUPLICATE KEY UPDATE value = VALUES(value), date = VALUES(date)');
			$values = array();
			foreach($data as $genre => $value)
				$values = array_merge($values, array($track, $genre, min(max($value, -1), 1), $user, $date));
			$insert->execute($values);
		}
		
		return static::fetch($track, $user);
	}
	
	public static function fetch($track, $user) {
		require_once 'includes/Database.php';
		
		$accu = array();
		$reg = array();
		$db = Database::getInstance();
		$select = $db->prepare('SELECT s.genre, value reg, IFNULL(value, votes/total) accu FROM '.static::TABLE_ACCU.' s LEFT JOIN '.static::TABLE_REG.' r ON (s.track = r.track AND s.genre = r.genre AND r.user = :user) WHERE s.track = :track AND ROUND(IFNULL(value, votes/total)) != 0');
		if($select->execute(array(':track' => $track, ':user' => $user)))
			while($genre = $select->fetch()) {
				$accu[$genre->genre] = doubleval($genre->accu);
				$reg[$genre->genre] = doubleval($genre->reg);
			}
		
		return array('accu' => $accu, 'reg' => $reg);
	}
	
	public static function playlist(array &$fields, array &$tables, array &$conditions, array &$ordering, $user, array $data) {
		$include = array();
		$exclude = array();
		foreach($data as $genre => $value) {
			if($value == 1)
				$include[] = $genre;
			elseif($value == -1)
				$exclude[] = $genre;
		}
		if(!empty($include))
			$conditions[] = 't.track IN (SELECT track FROM '.static::TABLE_ACCU_USER." WHERE user = $user AND genre IN (".implode(', ', $include).'))';
		if(!empty($exclude))
			$conditions[] = 't.track NOT IN (SELECT track FROM '.static::TABLE_ACCU_USER." WHERE user = $user AND genre IN (".implode(', ', $exclude).'))';
		$fields[] = 'GROUP_CONCAT(DISTINCT '.static::TABLE_ACCU_USER.'.genre) '.static::FIELD_PREFIX.'genres';
		$tables[] = array(static::TABLE_ACCU_USER, array(static::TABLE_ACCU_USER.".user = $user"));
		$ordering[] = 'SUM('.static::TABLE_ACCU_USER.'.value)';
	}
	
	public static function managePlaylistRow($row) {
		return $row[static::FIELD_PREFIX.'genres'] != NULL ? array_map('intval', explode(',', $row[static::FIELD_PREFIX.'genres'])) : array();
	}
	
	public static function profiles(array &$fields, array &$tables) {
		$fields[] = 'GROUP_CONCAT(DISTINCT '.static::TABLE_PROFILER.'.genre) '.static::FIELD_PREFIX.'genres';
		$tables[] = array(static::TABLE_PROFILER, 'profile');
	}
	
	public static function manageProfile($row) {
		return $row[static::FIELD_PREFIX.'genres'] != NULL ? array_map('intval', explode(',', $row[static::FIELD_PREFIX.'genres'])) : array();
	}
	
	public static function profilerEdit($profile, array $data) {
		static::profilerDelete($profile);
		
		require_once 'includes/Database.php';
		$db = Database::getInstance();
		if(!empty($data)) {
			$insert = $db->prepare('INSERT INTO '.static::TABLE_PROFILER.' (profile, genre) VALUES '.implode(', ', array_fill(0, count($data), '(?, ?)')));
			$values = array();
			foreach(array_keys($data) as $genre)
				$values = array_merge($values, array($profile, $genre));
			$insert->execute($values);
		}
	}
	
	public static function profilerDelete($profile) {
		require_once 'includes/Database.php';

		$db = Database::getInstance();
		$delete = $db->prepare('DELETE FROM '.static::TABLE_PROFILER.' WHERE profile = :profile');
		$delete->execute(array(':profile' => $profile));
	}
}

?>