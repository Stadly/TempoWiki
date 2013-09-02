<?php

final class Auth {
	private function __construct() {}
	private function __clone() {}
	
	public static function authenticate() {
		require_once 'includes/User.php';
		
		$_SESSION['authenticated'] = FALSE;
		$auth = array();
		$user = User::get();
		
		if($user !== 0) {
			if(isset($_GET['password'])) {
				if(isset($_SESSION['key']) && $_GET['password'] == self::getPassword($_SESSION['key']))
					$_SESSION['authenticated'] = TRUE;
			} else {
				$_SESSION['key'] = self::generateKey();
				$auth['key'] = $_SESSION['key'];
			}
		}
		
		$auth['authenticated'] = $_SESSION['authenticated'];
		if($_SESSION['authenticated']) {
			require_once 'properties/Properties.php';
			require_once 'profiler/Profiler.php';
			$auth['config'] = Properties::config();
			$auth['profiles'] = Profiler::fetch($user);
		}
		return $auth;
	}
	
	public static function authenticated() {
		return isset($_SESSION['authenticated']) && $_SESSION['authenticated'];
	}
	
	private static function getPassword($key) {
		// Perform some secret algorithm on the key
		return $key;
	}
	
	private static function generateKey($length = 20) {
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$randomString = '';
		for($i = 0; $i < $length; ++$i)
			$randomString .= $characters[rand(0, strlen($characters)-1)];
		return $randomString;
	}
}

?>
