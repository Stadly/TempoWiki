<?php

final class Profiler {
	const TABLE = 'tw_profile';
	
	private function __construct() {}
	private function __clone() {}
		
	public static function fetch($user) {
		require_once 'includes/Database.php';
		require_once 'properties/Properties.php';

		$fields = array();
		$tables = array();
		Properties::profiles($fields, $tables);

		$profiles = array();
		$db = Database::getInstance();
		$sqlJoin = '';
		for($i = 0 ; $i < count($tables); ++$i)
			$sqlJoin .= " LEFT JOIN {$tables[$i][0]} USING ({$tables[$i][1]})";
		$sqlFields = empty($fields) ? '' : ', '.implode(', ', $fields);
		$select = $db->prepare("SELECT profile, name, active$sqlFields FROM ".self::TABLE."$sqlJoin WHERE user = :user GROUP BY profile");
		if($select->execute(array(':user' => $user)))
			while($row = $select->fetch(PDO::FETCH_ASSOC)) {
				$profile['profile'] = intval($row['profile']);
				$profile['name'] = $row['name'];
				$profile['active'] = filter_var($row['active'], FILTER_VALIDATE_BOOLEAN);
				$profile['properties'] = Properties::manageProfile($row);
				$profiles[] = $profile;
			}
		
		return $profiles;
	}
	
	public static function edit() {
		if(isset($_POST['profile'])) {
			require_once 'includes/Auth.php';

			if(Auth::authenticated()) {
				require_once 'properties/Properties.php';

				return Properties::profilerEdit($_POST['profile'], $_POST);
			}
		}
		return array();
	}
	
	public static function create() {
		if(isset($_POST['name'])) {
			require_once 'includes/Auth.php';

			if(Auth::authenticated()) {
				require_once 'includes/Database.php';
				require_once 'includes/User.php';

				$db = Database::getInstance();
				$active = $db->prepare('UPDATE '.self::TABLE.' SET active = 0 WHERE user = :user');
				$active->execute(array(':user' => User::get()));
				$insert = $db->prepare('INSERT INTO '.self::TABLE.' (name, user, active) VALUES (:name, :user, :active)');
				if($insert->execute(array(':name' => $_POST['name'], ':user' => User::get(), ':active' => TRUE)))
					return $db->lastInsertId();
			}
		}
		return 0;
	}
	
	public static function rename() {
		if(isset($_POST['profile']) && isset($_POST['name'])) {
			require_once 'includes/Auth.php';

			if(Auth::authenticated()) {
				require_once 'includes/Database.php';
				require_once 'includes/User.php';

				$db = Database::getInstance();
				$update = $db->prepare('UPDATE '.self::TABLE.' SET name = :name WHERE profile = :profile AND user = :user');
				$update->execute(array(':profile' => $_POST['profile'], ':user' => User::get(), ':name' => $_POST['name']));
			}
		}
	}
	
	public static function delete() {
		if(isset($_POST['profile'])) {
			require_once 'includes/Auth.php';

			if(Auth::authenticated()) {
				require_once 'includes/Database.php';
				require_once 'includes/User.php';

				$db = Database::getInstance();
				$delete = $db->prepare('DELETE FROM '.self::TABLE.' WHERE profile = :profile AND user = :user');
				if($delete->execute(array(':profile' => $_POST['profile'], ':user' => User::get())))
					if($delete->rowCount() > 0) {
						require_once 'properties/Properties.php';
						Properties::profilerDelete($_POST['profile']);
					}
			}
		}
	}
	
	public static function active() {
		if(isset($_POST['profile'])) {
			require_once 'includes/Auth.php';

			if(Auth::authenticated()) {
				require_once 'includes/Database.php';
				require_once 'includes/User.php';

				$db = Database::getInstance();
				$reset = $db->prepare('UPDATE '.self::TABLE.' SET active = 0 WHERE user = :user');
				$reset->execute(array(':user' => User::get()));
				$update = $db->prepare('UPDATE '.self::TABLE.' SET active = 1 WHERE profile = :profile AND user = :user');
				$update->execute(array(':profile' => $_POST['profile'], ':user' => User::get()));
			}
		}
	}
}

?>
