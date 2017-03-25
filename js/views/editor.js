function Editor(player, Button, Throbber) {
	var editing = {track: null, metadata: {}};
	var container = TW.createTab('editor');
	var callback;
	
	var currentElm = container.appendChild(document.createElement('h2'));
	var form = container.appendChild(document.createElement('form'));
	var throbber = Throbber.forElement(form);
	var properties = Properties.forEditor(form);

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
	
	this.edit = function(track, metadata, func) {
		callback = func;
		editing.track = track;
		editing.metadata = metadata;
		load();
		TW.changeTab('editor');
	};
	
	this.confirm = function(track, metadata, func) {
		this.edit(track, metadata, func);
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

		properties.changeTrack(status);
	}
	
	function load() {
		properties.load(editing.metadata);
		changeTrack();
		enable();
	}
	
	function enable() {
		btns.style.display = '';
		throbber.hide();
		properties.enable();
	}
	
	function disable() {
		btns.style.display = 'none';
		throbber.show();
		throbber.showContent();
		throbber.setSize('normal');
		properties.disable();
	}

	function submit() {
		disable();
		
		var data = new FormData();
		data.append('track', editing.track.uri);
		properties.submit(data);

		new AjaxRequest
		(	SERVER+'register.php'
		,	{	callback:
				function() {
					// Success registering metadata
					var metadata = eval('('+this.responseText+');');
					if(typeof callback === 'function')
						callback(metadata);
					enable();
				}
			,	error:
				function() {
					// Error registering metadata
					console.log('Error registering metadata');
					console.log(this);
					enable();
				}
			}
		,	data
		,	'User'
		);
	}

	function cancel() {
		editing.track = null;
		editing.metadata = {};
		load();
		TW.changeTab('player');
	}
}