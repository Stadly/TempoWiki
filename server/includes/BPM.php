<?php

class BPM {
	const TABLE = 'tw_reg_bpm';
	const STAT_TABLE = 'tw_stat_bpm';
	
	public static function register($track, $user, array $post, $date) {
		if(isset($post['bpm'])) {
			require_once 'includes/Database.php';
			
			$db = Database::getInstance();
			if(empty($post['bpm'])) {
				$delete = $db->prepare('DELETE FROM '.self::TABLE.' WHERE track = :track AND user = :user');
				$delete->execute(array(':track' => $track, ':user' => $user));
			} else {
				$insert = $db->prepare('INSERT INTO '.self::TABLE.' (track, bpm, user, date) VALUES (:track, :bpm, :user, :date) ON DUPLICATE KEY UPDATE bpm = VALUES(bpm), date = VALUES(date)');
				$insert->execute(array(':track' => $track, ':bpm' => $post['bpm'], ':user' => $user, ':date' => $date));
			}
		}
		
		return self::fetch($track, $user);
	}
	
	public static function fetch($track, $user) {
		require_once 'includes/Database.php';
		
		$db = Database::getInstance();
		$select = $db->prepare('SELECT IFNULL(r.bpm, s.bpm) bpm FROM '.self::STAT_TABLE.' s LEFT JOIN '.self::TABLE.' r ON (s.track = r.track AND user = :user) WHERE s.track = :track ORDER BY votes, RAND() DESC LIMIT 0,1');
		if($select->execute(array(':track' => $track, ':user' => $user)))
			return $select->fetch(PDO::FETCH_COLUMN);
		
		return 0;
	}
	
	public static function playlist(array &$fields, array &$tables, array &$conditions, array &$ordering, $user, array $post) {
		$tableAlias = 'b';
		
		$statConditions = array();
		$joinConditions = array('track = t.track');
		if(!empty($post['bpm-min'])) {
			$conditions[] = "IFNULL({$tableAlias}r.bpm, {$tableAlias}s.bpm) >= ".($post['bpm-min']-0.5);
			$statConditions[] = "{$tableAlias}s.bpm >= ".($post['bpm-min']-0.5);
			$joinConditions[] = 'bpm >= '.($post['bpm-min']-0.5);
		}
		if(!empty($post['bpm-max'])) {
			$conditions[] = "IFNULL({$tableAlias}r.bpm, {$tableAlias}s.bpm) < ".($post['bpm-max']+0.5);
			$statConditions[] = "{$tableAlias}s.bpm < ".($post['bpm-max']+0.5);
			$joinConditions[] = 'bpm < '.($post['bpm-max']+0.5);
		}
		$statConditions[] = "{$tableAlias}s.bpm = (SELECT bpm FROM ".self::STAT_TABLE.' WHERE '.implode(' AND ', $joinConditions)." ORDER BY votes/total DESC LIMIT 0,1)";
		$fields[] = "IFNULL({$tableAlias}r.bpm, {$tableAlias}s.bpm) bpm";
		$tables[] = array(self::STAT_TABLE, $tableAlias.'s', $statConditions);
		$tables[] = array(self::TABLE, $tableAlias.'r', array("{$tableAlias}r.user = $user"));
	}
}

?>
