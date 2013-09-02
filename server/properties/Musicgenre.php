<?php

require_once 'properties/Genre.php';

final class Musicgenre extends Genre {
	const FIELD_PREFIX = 'music';
	const TABLE_CONF = 'tw_musicgenre_conf';
	const TABLE_REG = 'tw_musicgenre_reg';
	const TABLE_ACCU = 'tw_musicgenre_accu';
	const TABLE_ACCU_USER = 'tw_musicgenre_accu_user';
	const TABLE_PROFILER = 'tw_profile_musicgenre';
}

?>