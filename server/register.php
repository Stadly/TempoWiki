<?php

require_once 'includes/initiate.php';
require_once 'includes/TempoWiki.php';

die(json_encode(TempoWiki::register()));

?>
