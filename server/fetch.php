<?php

require_once 'includes/initiate.php';

if(isset($_POST['track'])) {
	require_once 'includes/User.php';
	
	$user = User::get();
	if($user !== FALSE) {
		require_once 'includes/Track.php';
		require_once 'includes/BPM.php';
		require_once 'includes/DanceGenre.php';
		
		$result = array('track' => $_POST['track']);
		$track = Track::get($_POST['track']);
		if($track != 0) {
			$bpm = BPM::fetch($track, $user);
			if(!empty($bpm))
				$result['bpm'] = $bpm;
			$danceGenres = DanceGenre::fetch($track, $user);
			if(!empty($danceGenres))
				$result['dance-genres'] = $danceGenres;
		}
		die(json_encode($result));
	}
}

?>
