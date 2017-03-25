var SERVER = 'http://www.myrtveit.com/tempowiki/';		// Online server

(function() {
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
					Properties.instantiate(config, css, Button, Throbber, Popup);
					Editor = new Editor(models.player, Button, Throbber);
					Player = new Player(models.player, Button, Throbber);
					new Playlist(models, css, Button, Throbber, List);
					Profiler = new Profiler(profiles, css, TabBar);

					models.application.load('arguments').done(tabs);
					models.application.addEventListener('arguments', tabs);

					function tabs() {
						var tabs = document.getElementsByClassName('tab');
						for(var i = 0; i < tabs.length; ++i)
							tabs[i].style.display = 'none';

						var current = document.getElementById(models.application.arguments[0]);
						if(current)
							current.style.display = '';

						Profiler.changeTab(models.application.arguments[0]);
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
})();