var SERVER = 'http://www.myrtveitfoto.no/tempowiki/';	// Online server
//var SERVER = 'http://tempowiki.com/';					// Local server

require(['$api/models', '$views/utils/css', '$views/list#List', '$views/buttons#Button', '$views/throbber#Throbber', '$views/popup#Popup', '$views/tabbar#TabBar', 'main.lang'], function(models, css, List, Button, Throbber, Popup, TabBar, locale) {
	// gettext compliant
	window._ = function() {
		return locale.get.apply(locale, arguments);
	};
	var throbber = Throbber.forElement(document.getElementById('wrapper'), 100);
	models.session.user.load('username', 'identifier').done(function() {
		Auth.authenticate
		(	models.session.user
		,	function(config, profiles) {
				// Success authenticating
				throbber.hide();
				TW = new TW(models.application);
				Tempo = new Tempo(config.tempo, Button, Throbber);
				Dancegenres = new Dancegenres(config.dancegenres, css, Button, Popup);
				Musicgenres = new Musicgenres(config.musicgenres, css, Button, Popup);
				Editor = new Editor(models.player, Button, Throbber);
				new Player(models.player, Button, Throbber);
				new Playlist(models, css, Throbber, List);
				var profiler = new Profiler(profiles, css, TabBar);

				models.application.load('arguments').done(tabs);
				models.application.addEventListener('arguments', tabs);

				function tabs() {
					var tabs = document.getElementsByClassName('tab');
					for(var i = 0; i < tabs.length; ++i)
						tabs[i].style.display = 'none';

					var current = document.getElementById(models.application.arguments[0]);
					if(current)
						current.style.display = '';
					
					profiler.changeTab(models.application.arguments[0]);
				}
			}
		,	function() {
				// Error authenticating
				console.log('Error authenticating');
				console.log(this);
			}
		);
	});
});
