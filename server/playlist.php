<?php

require_once 'includes/initiate.php';
require_once 'includes/User.php';

$user = User::get();
if($user !== FALSE) {
	require_once 'includes/Tempo.php';
	require_once 'includes/Dancegenre.php';
	require_once 'includes/Musicgenre.php';

	$fields = array();
	$tables = array();
	$conditions = array();
	$ordering = array();
	Tempo::playlist($fields, $tables, $conditions, $ordering, $user, empty($_POST['tempo']) ? array() : json_decode($_POST['tempo'], TRUE));
	Dancegenre::playlist($fields, $tables, $conditions, $ordering, $user, empty($_POST['dancegenres']) ? array() : json_decode($_POST['dancegenres'], TRUE));
	Musicgenre::playlist($fields, $tables, $conditions, $ordering, $user, empty($_POST['musicgenres']) ? array() : json_decode($_POST['musicgenres'], TRUE));
	
	require_once 'includes/Database.php';
	$db = Database::getInstance();
	$sqlJoin = '';
	for($i = 0 ; $i < count($tables); ++$i)
		$sqlJoin .= " LEFT JOIN {$tables[$i][0]} ON (".implode(' AND ', array_merge(array("t.track = {$tables[$i][0]}.track"), $tables[$i][1])).')';
	$seed = crc32(microtime());
	$sqlFields = empty($fields) ? '' : ', '.implode(', ', $fields);
	$sqlWhere = empty($conditions) ? '' : ' WHERE '.implode(' AND ', $conditions);
	$sqlOrdering = (empty($ordering) ? '' : '('.implode('+', $ordering).")*")."RAND($seed) DESC";
	$select = $db->prepare("SELECT t.spotify track$sqlFields FROM tw_tracks t$sqlJoin$sqlWhere GROUP BY t.track ORDER BY $sqlOrdering LIMIT 0,200");

	$result = array();
	if($select->execute())
		$result = $select->fetchAll(PDO::FETCH_ASSOC);
	
	die(json_encode($result));
}

?>
