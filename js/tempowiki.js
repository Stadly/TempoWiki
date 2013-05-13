//var SERVER = 'http://www.myrtveitfoto.no/tempowiki/';
var SERVER = 'http://tempowiki.com/';

require(['$api/models', '$views/utils/css', '$views/list#List', '$views/buttons#Button', '$views/throbber#Throbber', '$views/popup#Popup'], function(models, css, List, Button, Throbber, Popup) {
	var throbber = Throbber.forElement(document.getElementById('wrapper'), 100);
	// TODO: Load translation file, join the promise with the user loading
	models.session.user.load('username', 'identifier').done(function() {
		Auth.authenticate
		(	models.session.user
		,	function(config) {
				// Success authenticating
				throbber.hide();
				TW = new TW(models.application);
				BPM = new BPM(config.bpm, Throbber);
				DanceGenres = new DanceGenres(config['dance-genres'], css, Button, Popup);
				var editor = new Editor(models.player, Button, Throbber);
				new Player(models.player, Button, Throbber, editor);
				new Playlist(models, css, Throbber, List);

				models.application.load('arguments').done(tabs);
				models.application.addEventListener('arguments', tabs);

				function tabs() {
					var tabs = document.getElementsByClassName('tab');
					for(var i = 0; i < tabs.length; ++i)
						tabs[i].style.display = 'none';

					var current = document.getElementById(models.application.arguments[0]);
					if(current)
						current.style.display = '';
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
