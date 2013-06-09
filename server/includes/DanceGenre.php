<?php

require_once 'includes/Genre.php';

class Dancegenre extends Genre {
	const FIELD_PREFIX = 'dance';
	const TABLE_CONF = 'tw_dancegenre_conf';
	const TABLE_REG = 'tw_dancegenre_reg';
	const TABLE_STAT = 'tw_dancegenre_stat';
	const TABLE_STAT_USER = 'tw_dancegenre_stat_user';
}

?>