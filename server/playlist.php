<?php

require_once 'includes/initiate.php';
require_once 'includes/User.php';

$user = User::get();
if($user !== FALSE) {
	require_once 'includes/DanceGenre.php';
	require_once 'includes/BPM.php';

	$fields = array();
	$tables = array();
	$conditions = array();
	$ordering = array();
	DanceGenre::playlist($fields, $tables, $conditions, $ordering, $user, $_POST);
	BPM::playlist($fields, $tables, $conditions, $ordering, $user, $_POST);
	
	require_once 'includes/Database.php';
	$db = Database::getInstance();
	$sqlJoin = '';
	for($i = 0 ; $i < count($tables); ++$i)
		$sqlJoin .= " LEFT JOIN {$tables[$i][0]} {$tables[$i][1]} ON (".implode(' AND ', array_merge(array("t.track = {$tables[$i][1]}.track"), $tables[$i][2])).')';
	$seed = crc32(microtime());
	$sqlFields = empty($fields) ? '' : ', '.implode(', ', $fields);
	$sqlWhere = empty($conditions) ? '' : ' WHERE '.implode(' AND ', $conditions);
	$sqlOrdering = (empty($ordering) ? '' : '('.implode('+', $ordering).")*")."RAND($seed) DESC";
	$select = $db->prepare("SELECT t.spotify track$sqlFields FROM tw_tracks t$sqlJoin$sqlWhere GROUP BY t.track ORDER BY $sqlOrdering");

	$result = array();
	if($select->execute())
		$result = $select->fetchAll(PDO::FETCH_ASSOC);
	
	die(json_encode($result));
}

?>
