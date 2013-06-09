<?php

class Tempo {
	const TABLE_CONF = 'tw_tempo_conf';
	const TABLE_CONF_UNIT = 'tw_tempo_conf_unit';
	const TABLE_REG = 'tw_tempo_reg';
	const TABLE_STAT = 'tw_tempo_stat';
	
	public static function config() {
		require_once 'includes/Database.php';
		
		$db = Database::getInstance();
		
		$config = array();
		$select = $db->prepare('SELECT property, value FROM '.self::TABLE_CONF);
		if($select->execute())
			$config = $select->fetchAll(PDO::FETCH_KEY_PAIR);
		
		$units = array();
		$selectUnit = $db->prepare('SELECT id, name, unit, multiplier FROM '.self::TABLE_CONF_UNIT.' ORDER BY `order`');
		if($selectUnit->execute())
			while($unit = $selectUnit->fetch())
				$units[] = array(intval($unit->id), doubleval($unit->multiplier), $unit->name, $unit->unit);
		
		return array('config' => $config, 'units' => $units);
	}
	
	public static function register($track, $user, $tempo, $date) {
		if(isset($tempo)) {
			require_once 'includes/Database.php';
			
			$db = Database::getInstance();
			if(empty($tempo)) {
				$delete = $db->prepare('DELETE FROM '.self::TABLE_REG.' WHERE track = :track AND user = :user');
				$delete->execute(array(':track' => $track, ':user' => $user));
			} else {
				$insert = $db->prepare('INSERT INTO '.self::TABLE_REG.' (track, tempo, user, date) VALUES (:track, :tempo, :user, :date) ON DUPLICATE KEY UPDATE tempo = VALUES(tempo), date = VALUES(date)');
				$insert->execute(array(':track' => $track, ':tempo' => $tempo, ':user' => $user, ':date' => $date));
			}
		}
		
		return self::fetch($track, $user);
	}
	
	public static function fetch($track, $user) {
		require_once 'includes/Database.php';
		
		$db = Database::getInstance();
		$select = $db->prepare('SELECT IFNULL(r.tempo, s.tempo) tempo FROM '.self::TABLE_STAT.' s LEFT JOIN '.self::TABLE_REG.' r ON (s.track = r.track AND user = :user) WHERE s.track = :track ORDER BY votes, RAND() DESC LIMIT 0,1');
		if($select->execute(array(':track' => $track, ':user' => $user)))
			return $select->fetch(PDO::FETCH_COLUMN);
		
		return 0;
	}
	
	public static function playlist(array &$fields, array &$tables, array &$conditions, array &$ordering, $user, array $tempo) {
		$statConditions = array();
		$joinConditions = array('track = t.track');
		if(!empty($tempo['min'])) {
			$conditions[] = 'IFNULL('.self::TABLE_REG.'.tempo, '.self::TABLE_STAT.'.tempo) >= '.($tempo['min']-0.5);
			$statConditions[] = self::TABLE_STAT.'.tempo >= '.($tempo['min']-0.5);
			$joinConditions[] = 'tempo >= '.($tempo['min']-0.5);
		}
		if(!empty($tempo['max'])) {
			$conditions[] = 'IFNULL('.self::TABLE_REG.'.tempo, '.self::TABLE_STAT.'.tempo) < '.($tempo['max']+0.5);
			$statConditions[] = self::TABLE_STAT.'.tempo < '.($tempo['max']+0.5);
			$joinConditions[] = 'tempo < '.($tempo['max']+0.5);
		}
		$statConditions[] = self::TABLE_STAT.'.tempo = (SELECT tempo FROM '.self::TABLE_STAT.' WHERE '.implode(' AND ', $joinConditions)." ORDER BY votes/total DESC LIMIT 0,1)";
		$fields[] = 'IFNULL('.self::TABLE_REG.'.tempo, '.self::TABLE_STAT.'.tempo) tempo';
		$tables[] = array(self::TABLE_STAT, $statConditions);
		$tables[] = array(self::TABLE_REG, array(self::TABLE_REG.".user = $user"));
	}
}

?>
