<?php

chdir('..');

require_once 'includes/initiate.php';
require_once 'profiler/Profiler.php';

die(Profiler::create());

?>
