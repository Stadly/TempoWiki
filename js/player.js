function Player(player, Button, Throbber, editor) {
	var playing = {track: null, info: {}, loaded: false};
	var container = TW.createTab('player');
	
	var currentElm = container.appendChild(document.createElement('h2'));
	var form = container.appendChild(document.createElement('form'));
	var throbber = Throbber.forElement(form);

	var dancegenres = new Dancegenres.forPlayer(form);
	var musicgenres = new Musicgenres.forPlayer(form);
	var tempo = new Tempo.forPlayer(form);

	var btns = form.appendChild(document.createElement('fieldset'));
	btns.style.display = 'none';
	var btnLegend = btns.appendChild(document.createElement('legend'));
	var btnConfirm = Button.withLabel(_('Confirm'));
	btnConfirm.node.addEventListener('click', function(){editor.confirm(playing.track, playing.info, function(info){loadInfo(info);TW.changeTab('player');});});
	btns.appendChild(btnConfirm.node);
	var btnEdit = Button.withLabel();
	btnEdit.node.addEventListener('click', function(){editor.edit(playing.track, playing.info, function(info){loadInfo(info);TW.changeTab('player');});});
	btns.appendChild(btnEdit.node);

	player.load('track', 'position').done(changeTrack);
	player.addEventListener('change:track', changeTrack);

	var xhr, poller;
	function changeTrack() {
		if(typeof poller === 'undefined')
			poller = new Poller(900);
		
		// BUG: Event is not fired when track changes to one queued from a search result!
		// Reproduce: Start playing a playlist. Search for something. Queue a track from the search result. Go to app. Change track. App is not updated.
		if(player.track === null) {
			if(playing.track !== null) {
				var data = new FormData();
				data.append('prev', JSON.stringify({track: playing.info.track, played: poller.changeTrack()}));
				new AjaxRequest(SERVER+'fetch.php', {}, data);
				poller.stop();
			}
			
			playing.track = player.track;
			playing.info = {};
			currentElm.innerText = _('Start playing a song to show any information registered to it');
			load();
		} else if(playing.track !== player.track) {
			playing.track = player.track;
			
			var data = new FormData();
			data.append('track', player.track.uri);
			data.append('prev', JSON.stringify({track: playing.info.track, played: poller.changeTrack()}));
			if(typeof xhr !== 'undefined')
				xhr.abort();
			xhr = new AjaxRequest
			(	SERVER+'fetch.php'
			,	{	callback:
					function() {
						// Success fetching info
						var info = eval('('+this.responseText+');');
						loadInfo(info);
					}
				,	error:
					function() {
						// Error fetching info
						console.log('Error fetching info');
						console.log(this);
					}
				}
			,	data
			);
			
			playing.info = {};
			currentElm.innerHTML = _('Currently playing:')+' '+TW.trackToString(playing.track);
			load();
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
			dancegenres.load(playing.info.dancegenres || []);
			musicgenres.load(playing.info.musicgenres || []);
			tempo.load(playing.info);
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
	
	function Poller(interval) {
		var prev, played, length;
		var poller = null;
		
		this.changeTrack = function() {
			var trackPlayed = (played || 0)/(length || 1);
			played = 0;
			prev = player.position;
			length = playing.track.duration;
			if(poller !== null)
				clearInterval(poller);
			poller = setInterval(poll, interval);
			return trackPlayed;
		};
		
		this.stop = function() {
			if(poller !== null)
				clearInterval(poller);
			poller = null;
		};
		
		function poll() {
			// BUG: The position is not updated when playing after a playlist has been sorted!
			// Reproduce: Start playing a playlist inside app. Sort the list. console.log(player.position) for each poll and observe that it does not change.
			var pos = player.position;
			var length = pos - prev;
			
			if(length >= 0 && length <= interval*2)
				played += length;
			else
				played += interval;
			
			prev = pos;
		}
	}
}