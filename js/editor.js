function Editor(player, Button, Throbber) {
	var editing = {track: null, info: {}};
	var container = TW.createTab('editor');
	var callback;
	
	var currentElm = container.appendChild(document.createElement('h2'));
	var form = container.appendChild(document.createElement('form'));
	var throbber = Throbber.forElement(form);
	
	var dancegenres = new Dancegenres.forEditor(form);
	var musicgenres = new Musicgenres.forEditor(form);
	var tempo = new Tempo.forEditor(form);

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
			currentElm.innerHTML = _('Currently editing: {0}', TW.trackToString(editing.track));
		else
			currentElm.innerText = _('No track is currently being edited');

		tempo.changeTrack(status);
	}
	
	function load() {
		tempo.load(editing.info);
		dancegenres.load(editing.info.dancegenres);
		musicgenres.load(editing.info.musicgenres);
		changeTrack();
		enable();
	}
	
	function enable() {
		btns.style.display = '';
		throbber.hide();
		tempo.enable();
		dancegenres.enable();
		musicgenres.enable();
	}
	
	function disable() {
		btns.style.display = 'none';
		throbber.show();
		throbber.showContent();
		throbber.setSize('normal');
		tempo.disable();
		dancegenres.disable();
		musicgenres.disable();
	}

	function submit() {
		disable();
		
		var data = new FormData();
		data.append('track', editing.track.uri);

		tempo.submit(data);
		dancegenres.submit(data);
		musicgenres.submit(data);

		new AjaxRequest
		(	SERVER+'register.php'
		,	{	callback:
				function() {
					// Success registering info
					var info = eval('('+this.responseText+');');
					if(typeof callback === 'function')
						callback(info);
					enable();
				}
			,	error:
				function() {
					// Error registering info
					console.log('Error registering info');
					console.log(this);
					enable();
				}
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