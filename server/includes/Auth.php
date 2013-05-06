<?php

class Auth {
	public static function authenticate() {
		require_once 'includes/User.php';
		
		$_SESSION['authenticated'] = FALSE;
		$return = array();
		
		if(User::get() !== FALSE) {
			if(isset($_GET['key'])) {
				if(isset($_SESSION['keyhole']) && $_GET['key'] == self::getKey($_SESSION['keyhole']))
					$_SESSION['authenticated'] = TRUE;
			} else {
				$_SESSION['keyhole'] = self::generateKey();
				$return['keyhole'] = $_SESSION['keyhole'];
			}
		}
		
		$return['authenticated'] = $_SESSION['authenticated'];
		if($_SESSION['authenticated']) {
			require_once 'includes/Config.php';
			$return['config'] = Config::get();
		}
		return json_encode($return);
	}
	
	public static function authenticated() {
		return isset($_SESSION['authenticated']) && $_SESSION['authenticated'];
	}
	
	private static function getKey($keyhole) {
		return 'a'.$keyhole.'d';
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
