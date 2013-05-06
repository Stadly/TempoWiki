<?php

require_once 'includes/initiate.php';
require_once 'includes/Auth.php';

die(Auth::authenticate());

?>
