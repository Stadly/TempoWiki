function Player(player, Button, Throbber) {
	var self = this;
	var playing = {track: null, metadata: {}, loaded: false};
	var container = TW.createTab('player');
	
	var currentElm = container.appendChild(document.createElement('h2'));
	var form = container.appendChild(document.createElement('form'));
	var throbber = Throbber.forElement(form);
	var properties = Properties.forPlayer(form);
	var metadataExists = false;

	var btns = form.appendChild(document.createElement('fieldset'));
	btns.style.display = 'none';
	var btnLegend = btns.appendChild(document.createElement('legend'));
	var btnConfirm = Button.withLabel(_('Confirm'));
	btnConfirm.node.addEventListener('click', function(){Editor.confirm(playing.track, playing.metadata.accu, function(metadata){loadMetadata(metadata);TW.changeTab('player');});});
	btns.appendChild(btnConfirm.node);
	var btnEdit = Button.withLabel();
	btnEdit.node.addEventListener('click', function(){Editor.edit(playing.track, playing.metadata.accu, function(metadata){loadMetadata(metadata);TW.changeTab('player');});});
	btns.appendChild(btnEdit.node);

	player.load('track', 'position').done(changeTrack);
	player.addEventListener('change:track', changeTrack);
	
	this.getTrack = function() {
		return playing.track === null ? null : playing.track.uri;
	};

	var xhr, poller;
	function changeTrack() {
		if(typeof poller === 'undefined')
			poller = new Poller(900);
		
		// BUG: Event is not fired when track changes to one queued from a search result!
		// Reproduce: Start playing a playlist. Search for something. Queue a track from the search result. Go to app. Change track. App is not updated.
		if(player.track === null) {
			if(playing.track !== null) {
				var data = new FormData();
				data.append('prev', JSON.stringify({track: playing.metadata.track, played: poller.changeTrack()}));
				new AjaxRequest(SERVER+'fetch.php', {}, data);
				poller.stop();
			}
			
			playing.track = player.track;
			playing.metadata = {};
			currentElm.innerText = _('Start playing a song to show any information registered for it');
			load();
		} else if(playing.track !== player.track) {
			playing.track = player.track;
			
			var data = new FormData();
			data.append('track', player.track.uri);
			data.append('prev', JSON.stringify({track: playing.metadata.track, played: poller.changeTrack()}));
			if(typeof xhr !== 'undefined')
				xhr.abort();
			xhr = new AjaxRequest
			(	SERVER+'fetch.php'
			,	{	callback:
					function() {
						// Success fetching metadata
						var metadata = eval('('+this.responseText+');');
						loadMetadata(metadata);
					}
				,	error:
					function() {
						// Error fetching metadata
						console.log('Error fetching metadata');
						console.log(this);
					}
				}
			,	data
			);
			
			playing.metadata = {};
			currentElm.innerHTML = _('Currently playing: {0}', TW.trackToString(playing.track));
			load();
		}
	}
	
	this.displayButtons = function() {
		if(metadataExists) {
			btnEdit.setLabel(_('Edit'));
			btnLegend.innerText = _('Do you agree with the information registered for this track?');
			btnConfirm.node.style.display = properties.compareMetadata(playing.metadata.accu, playing.metadata.reg) ? 'none' : '';
		} else {
			btnEdit.setLabel(_('Register track information'));
			btnLegend.innerText = _('No information has been registered for this track yet');
			btnConfirm.node.style.display = 'none';
		}
	};

	function load() {
		if(!metadataLoaded() && playing.track !== null) {
			btns.style.display = 'none';
			throbber.show();
			throbber.showContent();
			throbber.setSize('normal');
		} else {
			btns.style.display = playing.track !== null ? '' : 'none';
			self.displayButtons();
			properties.load(playing.metadata.accu || {});
			throbber.hide();
		}
	}
	
	function loadMetadata(metadata) {
		if(metadataLoaded(metadata)) {
			playing.metadata = metadata;
			metadataExists = 'accu' in playing.metadata && Object.keys(playing.metadata.accu).length > 0;
			load();
		}
	}
	
	function metadataLoaded(metadata) {
		metadata = metadata || playing.metadata;
		return playing.track !== null && playing.track.uri === metadata.track;
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
			// BUG: The position is not updated if the playing track has been removed from the playlist, or tracks inserted before it
			// Reproduce: Start playing a playlist inside TempoWiki. Call list.tracks.clear(). console.log(player.position) for each poll and observe that it does not change.
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