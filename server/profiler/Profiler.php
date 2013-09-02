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

		$db = Database::getInstance();
		$sqlJoin = '';
		for($i = 0 ; $i < count($tables); ++$i)
			$sqlJoin .= " LEFT JOIN {$tables[$i][0]} USING ({$tables[$i][1]})";
		$sqlFields = empty($fields) ? '' : ', '.implode(', ', $fields);
		$select = $db->prepare("SELECT profile, name, active$sqlFields FROM ".self::TABLE."$sqlJoin WHERE user = $user GROUP BY profile");

		if($select->execute())
			return $select->fetchAll(PDO::FETCH_ASSOC);
		return array();
	}
	
	public static function register() {
		if(isset($_POST['profile'])) {
			require_once 'includes/Auth.php';

			if(Auth::authenticated()) {
				require_once 'properties/Properties.php';

				return Properties::profiler($_POST['profile'], $_POST);
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
				$insert = $db->prepare('INSERT INTO '.self::TABLE.' (user, name) VALUES (:user, :name)');
				if($insert->execute(array(':user' => User::get(), ':name' => $_POST['name'])))
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
