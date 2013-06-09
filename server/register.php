<?php

require_once 'includes/initiate.php';

if(isset($_POST['track'])) {
	require_once 'includes/User.php';
	
	$user = User::get();
	if($user !== FALSE) {
		require_once 'includes/Track.php';
		require_once 'includes/Tempo.php';
		require_once 'includes/Dancegenre.php';
		require_once 'includes/Musicgenre.php';
		
		$date = gmdate('Y-m-d H:i:s');
		$result = array('track' => $_POST['track']);
		$track = Track::register($_POST['track']);
		if($track != 0) {
			$tempo = Tempo::register($track, $user, isset($_POST['tempo']) ? $_POST['tempo'] : NULL, $date);
			if(!empty($tempo))
				$result['tempo'] = $tempo;
			$dancegenres = Dancegenre::register($track, $user, empty($_POST['dancegenres']) ? array() : json_decode($_POST['dancegenres'], TRUE), $date);
			if(!empty($dancegenres))
				$result['dancegenres'] = $dancegenres;
			$musicgenres = Musicgenre::register($track, $user, empty($_POST['musicgenres']) ? array() : json_decode($_POST['musicgenres'], TRUE), $date);
			if(!empty($musicgenres))
				$result['musicgenres'] = $musicgenres;
		}
		die(json_encode($result));
	}
}

?>
