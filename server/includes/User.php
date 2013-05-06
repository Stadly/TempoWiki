<?php

class User {
	const TABLE = 'tw_users';
	
	public static function get() {
		if(!isset($_SESSION['user']) || $_SESSION['user'] === FALSE) {
			$_SESSION['user'] = FALSE;
		
			if(isset($_POST['user-username']) && isset($_POST['user-name']) && isset($_POST['user-identifier'])) {
				require_once 'includes/Database.php';
				
				$db = Database::getInstance();
				$insert = $db->prepare('INSERT INTO '.self::TABLE.' (username, name, identifier) VALUES (:username, :name, :identifier) ON DUPLICATE KEY UPDATE username = VALUES(username), user = LAST_INSERT_ID(user)');
				if($insert->execute(array('username' => $_POST['user-username'], 'identifier' => $_POST['user-identifier'], 'name' => $_POST['user-name'])))
					$_SESSION['user'] = $db->lastInsertId();
			}
		}
		return $_SESSION['user'];
	}
}

?>
