<?php

require_once 'includes/initiate.php';

if(isset($_POST['track']) || isset($_POST['prev'])) {
	require_once 'includes/User.php';
	
	$user = User::get();
	if($user !== FALSE) {
		require_once 'includes/Plays.php';
		require_once 'includes/Track.php';
		
		if(!empty($_POST['prev'])) {
			$date = gmdate('Y-m-d H:i:s');
			$_POST['prev'] = json_decode($_POST['prev'], TRUE);
			if(!empty($_POST['prev']['track']) && !empty($_POST['prev']['played'])) {
				$prev = Track::get($_POST['prev']['track']);
				if(!empty($prev))
					Plays::register($prev, $_POST['prev']['played'], $user, $date);
			}
		}
		
		$result = array('track' => $_POST['track']);
		$track = Track::get($_POST['track']);
		if($track != 0) {
			require_once 'includes/Tempo.php';
			require_once 'includes/Dancegenre.php';
			require_once 'includes/Musicgenre.php';
			
			$tempo = Tempo::fetch($track, $user);
			if(!empty($tempo))
				$result['tempo'] = $tempo;
			$dancegenres = Dancegenre::fetch($track, $user);
			if(!empty($dancegenres))
				$result['dancegenres'] = $dancegenres;
			$musicgenres = Musicgenre::fetch($track, $user);
			if(!empty($musicgenres))
				$result['musicgenres'] = $musicgenres;
		}
		die(json_encode($result));
	}
}

?>
