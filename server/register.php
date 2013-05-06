<?php

require_once 'includes/initiate.php';

if(isset($_POST['track'])) {
	require_once 'includes/User.php';
	
	$user = User::get();
	if($user !== FALSE) {
		require_once 'includes/Track.php';
		require_once 'includes/BPM.php';
		require_once 'includes/DanceGenre.php';
		
		$date = gmdate('Y-m-d H:i:s');
		$result = array('track' => $_POST['track']);
		$track = Track::register($_POST['track']);
		if($track != 0) {
			$bpm = BPM::register($track, $user, $_POST, $date);
			if(!empty($bpm))
				$result['bpm'] = $bpm;
			$danceGenres = DanceGenre::register($track, $user, $_POST, $date);
			if(!empty($danceGenres))
				$result['dance-genres'] = $danceGenres;
		}
		die(json_encode($result));
	}
}

?>
