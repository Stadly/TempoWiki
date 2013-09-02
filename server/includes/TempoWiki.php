<?php

final class TempoWiki {
	private function __construct() {}
	private function __clone() {}
	
	public static function fetch() {
		if(isset($_POST['track']) || isset($_POST['prev'])) {
			require_once 'includes/Auth.php';

			if(Auth::authenticated()) {
				require_once 'includes/User.php';
				require_once 'includes/Plays.php';
				require_once 'includes/Track.php';
				require_once 'properties/Properties.php';

				if(!empty($_POST['prev'])) {
					$_POST['prev'] = json_decode($_POST['prev'], TRUE);
					if(!empty($_POST['prev']['track']) && !empty($_POST['prev']['played'])) {
						$prev = Track::get($_POST['prev']['track']);
						if(!empty($prev))
							Plays::register($prev, User::get(), $_POST['prev']['played'], gmdate('Y-m-d H:i:s'));
					}
				}

				return Properties::fetch($_POST['track'], User::get());
			}
		}
		return array();
	}
	
	public static function playlist() {
		require_once 'includes/Auth.php';

		if(Auth::authenticated()) {
			require_once 'includes/User.php';
			require_once 'includes/Database.php';
			require_once 'properties/Properties.php';
			require_once 'includes/Track.php';

			$fields = array();
			$tables = array();
			$conditions = array();
			$ordering = array();
			Properties::playlist($fields, $tables, $conditions, $ordering, User::get(), $_POST);

			$db = Database::getInstance();
			$sqlJoin = '';
			for($i = 0 ; $i < count($tables); ++$i)
				$sqlJoin .= " LEFT JOIN {$tables[$i][0]} ON (".implode(' AND ', array_merge(array("t.track = {$tables[$i][0]}.track"), $tables[$i][1])).')';
			$seed = crc32(microtime());
			$sqlFields = empty($fields) ? '' : ', '.implode(', ', $fields);
			$sqlWhere = empty($conditions) ? '' : ' WHERE '.implode(' AND ', $conditions);
			$sqlOrdering = (empty($ordering) ? '' : '('.implode('+', $ordering).")*")."RAND($seed) DESC";
			$select = $db->prepare("SELECT t.spotify track$sqlFields FROM ".Track::TABLE." t$sqlJoin$sqlWhere GROUP BY t.track ORDER BY $sqlOrdering LIMIT 0,200");

			if($select->execute())
				return $select->fetchAll(PDO::FETCH_ASSOC);
		}
		return array();
	}
	
	public static function register() {
		if(isset($_POST['track'])) {
			require_once 'includes/Auth.php';

			if(Auth::authenticated()) {
				require_once 'includes/User.php';
				require_once 'includes/Track.php';
				require_once 'properties/Properties.php';

				return Properties::register($_POST['track'], User::get(), $_POST, gmdate('Y-m-d H:i:s'));
			}
		}
		return array();
	}
}

?>
