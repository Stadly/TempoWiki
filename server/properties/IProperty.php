<?php

interface IProperty {
	public static function config();
	public static function register($track, $user, array $data, $date);
	public static function fetch($track, $user);
	public static function playlist(array &$fields, array &$tables, array &$conditions, array &$ordering, $user, array $data);
	public static function profiles(array &$fields, array &$tables);
	public static function profiler($profile, array $data);
	public static function profilerDelete($profile);
}

?>
