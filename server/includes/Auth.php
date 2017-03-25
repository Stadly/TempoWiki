<?php

final class Auth {
	private function __construct() {}
	private function __clone() {}
	
	public static function authenticate() {
		require_once 'includes/User.php';
		
		$auth = array('authenticated' => false);
		$user = User::get();
		
		$spotify = new \SpotifyWebAPI\Session(CLIENT_ID, CLIENT_SECRET);
		$spotify->requestCredentialsToken();
		$auth['token'] = $spotify->getAccessToken();
		
		if($user !== 0) {
			require_once 'properties/Properties.php';
			require_once 'profiler/Profiler.php';
			$auth['authenticated'] = true;
			$auth['config'] = Properties::config();
			$auth['profiles'] = Profiler::fetch($user);
		}
		
		return $auth;
	}
	
	public static function authenticated() {
		require_once 'includes/User.php';
		
		return User::get() !== 0;
	}
}

?>
