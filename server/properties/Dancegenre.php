<?php

require_once 'properties/Genre.php';

final class Dancegenre extends Genre {
	const FIELD_PREFIX = 'dance';
	const TABLE_CONF = 'tw_dancegenre_conf';
	const TABLE_REG = 'tw_dancegenre_reg';
	const TABLE_ACCU = 'tw_dancegenre_accu';
	const TABLE_ACCU_USER = 'tw_dancegenre_accu_user';
	const TABLE_PROFILER = 'tw_profile_dancegenre';
}

?>