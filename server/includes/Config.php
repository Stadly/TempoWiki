<?php

class Config {
	public static function get() {
		return array
		(	'dance-genres' => array
			(	array
				(	'1', 'Swing', 'Sw', array
					(	array('2', 'Boogie Woogie', 'BW', array())
					,	array('3', 'West Coast Swing', 'WCS', array())
					,	array('4', 'Lindy Hop', 'LH', array())
					)
				)
			,	array
				(	'5', 'Waltz', 'W', array
					(	array('6', 'Slow Waltz', 'SW', array())
					,	array('7', 'Viennese Waltz', 'VW', array())
					)
				)
			)
		,	'bpm' => array
			(	'units' => array
				(	array(1, 1, 'BPM', 'bpm')
				,	array(2, 0.25, 'Bar', 'bar')
				)
			)
		);
	}
}

?>
