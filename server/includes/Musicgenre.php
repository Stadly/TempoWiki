<?php

require_once 'includes/Genre.php';

class Musicgenre extends Genre {
	const FIELD_PREFIX = 'music';
	const TABLE_CONF = 'tw_musicgenre_conf';
	const TABLE_REG = 'tw_musicgenre_reg';
	const TABLE_STAT = 'tw_musicgenre_stat';
	const TABLE_STAT_USER = 'tw_musicgenre_stat_user';
}

?>