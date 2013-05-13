function Editor(player, Button, Throbber) {
	var editing = {track: null, info: {}};
	var container = document.getElementById('wrapper').appendChild(TW.createElement('div', 'tab-editor', 'tab'));
	var callback;
	
	currentElm = container.appendChild(document.createElement('h2'));
	var form = container.appendChild(document.createElement('form'));
	var throbber = Throbber.forElement(form);
	
	var danceGenres = new DanceGenres.forEditor(form);
	var bpm = new BPM.forEditor(form);

	var btn;
	var btns = form.appendChild(document.createElement('fieldset'));
	btn = Button.withLabel(_('Submit'));
	btn.node.addEventListener('click', submit);
	btns.appendChild(btn.node);
	btn = Button.withLabel(_('Reset'));
	btn.node.addEventListener('click', load);
	btns.appendChild(btn.node);
	btn = Button.withLabel(_('Cancel'));
	btn.node.addEventListener('click', cancel);
	btns.appendChild(btn.node);
	enable();

	player.load('track').done(changeTrack);
	player.addEventListener('change:track', changeTrack);
	player.addEventListener('change:playing', changeTrack);
	
	this.edit = function(track, info, func) {
		callback = func;
		editing.track = track;
		editing.info = info;
		load();
		TW.changeTab('editor');
	};
	
	this.confirm = function(track, info, func) {
		this.edit(track, info, func);
		submit(track);
	};
	
	function changeTrack() {
		var status = TW.editStatus.OK;
		if(player.track !== editing.track)
			status = TW.editStatus.DIFFERENT;
		else if(!player.playing)
			status = TW.editStatus.NOT_PLAYING;
		if(editing.track === null)
			status = TW.editStatus.NOT_EDITING;
		
		if(editing.track !== null)
			currentElm.innerHTML = _('Currently editing:')+' '+TW.trackToString(editing.track);
		else
			currentElm.innerText = _('No track is currently being edited');

		bpm.changeTrack(status);
	}
	
	function load() {
		danceGenres.load(editing.info['dance-genres']);
		bpm.load(editing.info);
		changeTrack();
		enable();
	}
	
	function enable() {
		btns.style.display = '';
		throbber.hide();
		danceGenres.enable();
		bpm.enable();
	}
	
	function disable() {
		btns.style.display = 'none';
		throbber.show();
		throbber.showContent();
		throbber.setSize('normal');
		danceGenres.disable();
		bpm.disable();
	};

	function submit() {
		disable();
		
		var data = new FormData();
		data.append('track', editing.track.uri);

		danceGenres.submit(data);
		bpm.submit(data);

		new AjaxRequest
		(	SERVER+'register.php'
		,	function() {
				// Success registering info
				var info = eval('('+this.responseText+');');
				if(typeof callback === 'function')
					callback(info);
				enable();
			}
		,	function() {
				// Error registering info
				console.log('Error registering info');
				console.log(this);
			}
		,	data
		);
	}

	function cancel() {
		editing.track = null;
		editing.info = {};
		load();
		TW.changeTab('player');
	}
}