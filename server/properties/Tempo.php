<?php

require_once 'properties/IProperty.php';

final class Tempo implements IProperty {
	const TABLE_CONF = 'tw_tempo_conf';
	const TABLE_CONF_UNIT = 'tw_tempo_conf_unit';
	const TABLE_REG = 'tw_tempo_reg';
	const TABLE_ACCU = 'tw_tempo_accu';
	const TABLE_PROFILER = 'tw_profile_tempo';
	const TABLE_PROFILER_UNIT = 'tw_profile_tempo_unit';
	
	private function __construct() {}
	private function __clone() {}
	
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
	
	public static function register($track, $user, array $data, $date) {
		if(isset($data['tempo'])) {
			require_once 'includes/Database.php';
			
			$db = Database::getInstance();
			if(empty($data['tempo'])) {
				$delete = $db->prepare('DELETE FROM '.self::TABLE_REG.' WHERE track = :track AND user = :user');
				$delete->execute(array(':track' => $track, ':user' => $user));
			} else {
				$insert = $db->prepare('INSERT INTO '.self::TABLE_REG.' (track, tempo, user, date) VALUES (:track, :tempo, :user, :date) ON DUPLICATE KEY UPDATE tempo = VALUES(tempo), date = VALUES(date)');
				$insert->execute(array(':track' => $track, ':tempo' => $data['tempo'], ':user' => $user, ':date' => $date));
			}
		}
		
		return self::fetch($track, $user);
	}
	
	public static function fetch($track, $user) {
		require_once 'includes/Database.php';
		
		$db = Database::getInstance();
		$select = $db->prepare('SELECT IFNULL(r.tempo, s.tempo) tempo FROM '.self::TABLE_ACCU.' s LEFT JOIN '.self::TABLE_REG.' r ON (s.track = r.track AND user = :user) WHERE s.track = :track ORDER BY votes, RAND() DESC LIMIT 0,1');
		if($select->execute(array(':track' => $track, ':user' => $user)))
			return $select->fetch(PDO::FETCH_COLUMN);
		
		return 0;
	}
	
	public static function playlist(array &$fields, array &$tables, array &$conditions, array &$ordering, $user, array $data) {
		$statConditions = array();
		$joinConditions = array('track = t.track');
		if(!empty($data['min'])) {
			$conditions[] = 'IFNULL('.self::TABLE_REG.'.tempo, '.self::TABLE_ACCU.'.tempo) >= '.($data['min']-0.5);
			$statConditions[] = self::TABLE_ACCU.'.tempo >= '.($data['min']-0.5);
			$joinConditions[] = 'tempo >= '.($data['min']-0.5);
		}
		if(!empty($data['max'])) {
			$conditions[] = 'IFNULL('.self::TABLE_REG.'.tempo, '.self::TABLE_ACCU.'.tempo) < '.($data['max']+0.5);
			$statConditions[] = self::TABLE_ACCU.'.tempo < '.($data['max']+0.5);
			$joinConditions[] = 'tempo < '.($data['max']+0.5);
		}
		$statConditions[] = self::TABLE_ACCU.'.tempo = (SELECT tempo FROM '.self::TABLE_ACCU.' WHERE '.implode(' AND ', $joinConditions)." ORDER BY votes/total DESC LIMIT 0,1)";
		$fields[] = 'IFNULL('.self::TABLE_REG.'.tempo, '.self::TABLE_ACCU.'.tempo) tempo';
		$tables[] = array(self::TABLE_ACCU, $statConditions);
		$tables[] = array(self::TABLE_REG, array(self::TABLE_REG.".user = $user"));
	}

	public static function profiles(array &$fields, array &$tables) {
		$fields[] = 'GROUP_CONCAT(DISTINCT '.static::TABLE_PROFILER_UNIT.'.unit ORDER BY '.static::TABLE_PROFILER_UNIT.'.`default` DESC) units';
		$tables[] = array(static::TABLE_PROFILER_UNIT, 'profile');
		$fields[] = static::TABLE_PROFILER.'.min tempoMin';
		$fields[] = static::TABLE_PROFILER.'.max tempoMax';
		$tables[] = array(static::TABLE_PROFILER, 'profile');
	}
	
	public static function profiler($profile, array $data) {
		static::profilerDelete($profile);
		
		if(!empty($data)) {
			require_once 'includes/Database.php';
			$db = Database::getInstance();
			if(!empty($data['range'])) {
				$insert = $db->prepare('INSERT INTO '.static::TABLE_PROFILER.' (profile, min, max) VALUES (:profile, :min, :max)');
				$insert->execute(array(':profile' => $profile, ':min' => $data['range']['min'], ':max' => $data['range']['max']));
			}
			if(!empty($data['units'])) {
				$insert = $db->prepare('INSERT INTO '.static::TABLE_PROFILER_UNIT.' (profile, unit, `default`) VALUES '.implode(', ', array_fill(0, count($data['units']), '(?, ?, ?)')));
				$values = array();
				foreach($data['units'] as $unit => $default)
					$values = array_merge($values, array($profile, $unit, $default));
				$insert->execute($values);
			}
		}
	}
	
	public static function profilerDelete($profile) {
		require_once 'includes/Database.php';

		$db = Database::getInstance();
		$delete = $db->prepare('DELETE FROM '.static::TABLE_PROFILER.' WHERE profile = :profile');
		$delete->execute(array(':profile' => $profile));
		$deleteUnit = $db->prepare('DELETE FROM '.static::TABLE_PROFILER_UNIT.' WHERE profile = :profile');
		$deleteUnit->execute(array(':profile' => $profile));
	}
	
	public static function defaultUnit() {
		if(isset($_POST['profile']) && isset($_POST['unit'])) {
			require_once 'includes/Auth.php';

			if(Auth::authenticated()) {
				require_once 'includes/Database.php';

				$db = Database::getInstance();
				$reset = $db->prepare('UPDATE '.self::TABLE_PROFILER_UNIT.' SET `default` = 0 WHERE profile = :profile');
				$reset->execute(array(':profile' => $_POST['profile']));
				$update = $db->prepare('UPDATE '.self::TABLE_PROFILER_UNIT.' SET `default` = 1 WHERE profile = :profile AND unit = :unit');
				$update->execute(array(':profile' => $_POST['profile'], ':unit' => $_POST['unit']));
			}
		}
	}
}

?>
