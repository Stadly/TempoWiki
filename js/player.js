function Player(player, Button, Throbber, editor) {
	var playing = {track: null, info: {}, loaded: false};
	var container = document.getElementById('wrapper').appendChild(TW.createElement('div', 'tab-player', 'tab'));
	
	var currentElm = container.appendChild(document.createElement('h2'));
	var form = container.appendChild(document.createElement('form'));
	var throbber = Throbber.forElement(form);

	var danceGenres = new DanceGenres.forPlayer(form);
	var bpm = new BPM.forPlayer(form);

	var btns = form.appendChild(document.createElement('fieldset'));
	btns.style.display = 'none';
	var btnLegend = btns.appendChild(document.createElement('legend'));
	var btnConfirm = Button.withLabel(_('Confirm'));
	btnConfirm.node.addEventListener('click', function(){editor.confirm(playing.track, playing.info, function(info){loadInfo(info);TW.changeTab('player');});});
	btns.appendChild(btnConfirm.node);
	var btnEdit = Button.withLabel();
	btnEdit.node.addEventListener('click', function(){editor.edit(playing.track, playing.info, function(info){loadInfo(info);TW.changeTab('player');});});
	btns.appendChild(btnEdit.node);

	player.load('track').done(changeTrack);
	player.addEventListener('change:track', changeTrack);

	var xhr;
	function changeTrack() {
		// Sometimes event is not fired when track changes to one queued from a search result! Don't know what to do about this.
		// Reproduce: Start playing a playlist. Search for something. Queue a track from the search result. Go to app. Change track. App is not updated.
		if(player.track === null) {
			playing.track = player.track;
			playing.info = {};
			currentElm.innerText = _('Start playing a song to show any information registered to it');
			load();
		} else if(playing.track !== player.track) {
			playing.track = player.track;
			currentElm.innerHTML = _('Currently playing:')+' '+TW.trackToString(playing.track);
			load();
			
			var data = new FormData();
			data.append('track', playing.track.uri);
			if(typeof xhr !== 'undefined')
				xhr.abort();
			xhr = new AjaxRequest
			(	SERVER+'fetch.php'
			,	function() {
					// Success fetching info
					var info = eval('('+this.responseText+');');
					loadInfo(info);
				}
			,	function() {
					// Error fetching info
				}
			,	data
			);
		}
	}

	function load() {
		if(!infoLoaded() && playing.track !== null) {
			btns.style.display = 'none';
			throbber.show();
			throbber.showContent();
			throbber.setSize('normal');
		} else {
			btns.style.display = playing.track !== null ? '' : 'none';
			if(hasTrackInfo()) {
				btnEdit.setLabel(_('Edit'));
				btnLegend.innerText = _('Do you agree with the information registered to this track?');
				btnConfirm.node.style.display = '';
			} else {
				btnEdit.setLabel(_('Register track information'));
				btnLegend.innerText = _('No information has been registered to this track yet');
				btnConfirm.node.style.display = 'none';
			}
			danceGenres.load(playing.info['dance-genres'] || []);
			bpm.load(playing.info);
			throbber.hide();
		}
	}
	
	function loadInfo(info) {
		if(infoLoaded(info)) {
			playing.info = info;
			load();
		}
	}
	
	function infoLoaded(info) {
		info = info || playing.info;
		return playing.track !== null && playing.track.uri === info.track;
	}
	
	function hasTrackInfo() {
		return Object.keys(playing.info).length > (typeof playing.info.echoNest !== 'undefined' ? 2 : 1);
	}
}