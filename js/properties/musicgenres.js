function Musicgenres(config, css, Button, Throbber, Popup) {
	var instances = [];
	var genres = new Genres(config, css, Button);
	
	this.forPlayer = function(parent, callback) {
		instances.push(this);
		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Music genres registered for this track')+'</legend>';

		var instance = new genres.display(container, 3, true, callback);
		this.load = instance.load;
		this.changeProfile = instance.changeProfile;
		this.compareMetadata = instance.compareMetadata;
		instance.disable();
	};
	
	this.forEditor = function(parent, callback) {
		instances.push(this);
		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Music genres to register for this track')+'</legend>';

		var instance = new genres.display(container, 3, true, callback);
		this.enable = instance.enable;
		this.disable = instance.disable;
		this.load = instance.load;
		this.changeProfile = instance.changeProfile;
		this.submit = function(data) {
			data.append('musicgenres', JSON.stringify(instance.getSelection()));
		};
	};
	
	this.forPlaylist = function(playlist, func, parent, callback) {
		instances.push(this);
		var columns = [];
		var popups = {};
		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Music genres for the playlist')+'</legend>';
		
		var instance = new genres.display(container, 3, false, callback);
		
		this.changeProfile = function(config) {
			// TODO: Remove musicgenre-column from playlist if musicgenres should not be shown
			instance.changeProfile(config);
			for(var i = 0; i < playlist.model.items.length; ++i) {
				var track = playlist.model.items[i];
				if('properties' in track) {
					track.properties.musicgenres = this.updateTrack(track.properties.musicgenres.config);
					for(var j = 0; j < columns.length; ++j) {
						var parent = playlist.view.rows[i].children[columns[j]];
						while(parent.firstChild)
							 parent.removeChild(parent.firstChild);
						parent.appendChild(playlistCell('properties' in track ? track.properties.musicgenres : null));
					}
				}
			}
		};
		
		function playlistCell(config) {
			if(config === null)
				return TW.createElement('div');
			var div = TW.createElement('div', {content: config.short});
			div.addEventListener('mouseover', function() {config.popup.showFor(div);});
			div.addEventListener('mouseout', function() {config.popup.hide();});
			return div;
		}
		
		this.setPlaylist = function(list) {
			playlist = list;
			for(var i = 0; i < playlist.model.fields.length; ++i)
				if(playlist.model.fields[i].id === 'musicgenre') {
					columns.push(i);
					css.removeClass(playlist.view.nodes.headerRow.children[i], 'undefined');
					css.addClass(playlist.view.nodes.headerRow.children[i], 'sp-list-cell-musicgenre');
					playlist.view.nodes.headerRow.children[i].childNodes[0].textContent = _('Music genres');
					// When a track is replaced by an other track (for example when a track is not available in a region), config is undefined on that track
					playlist.model.fields[i] = {id: 'musicgenre', title: _('Music genres'), className: 'sp-list-cell-musicgenre', fixedWidth: 92, neededProperties: {track: ['musicgenres']}, get: function(a){return playlistCell('properties' in a.track ? a.track.properties.musicgenres : null);}};
				}
		};
		
		this.submit = function(data) {
			var selection = instance.getSelection();
			if(Object.keys(selection).length > 0) {
				data.append('musicgenres', JSON.stringify(selection));
				return true;
			}
			return false;
		};
		
		this.updateTrack = function(config) {
			var musicgenres = instance.getNames(config || []);
			
			if(!popups.hasOwnProperty(musicgenres.short))
				popups[musicgenres.short] = Popup.withText(musicgenres.name);
			musicgenres.popup = popups[musicgenres.short];
			
			return musicgenres;
		};
		
		this.playlistName = instance.playlistName;
		
		this.setPlaylist(playlist);
	};
	
	this.forProfiler = function(parent, callback) {
		instances.push(this);
		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Applicable music genres')+'</legend>';

		var instance = new genres.display(container, 2, false, callback);
		this.changeProfile = function(config) {
			var profile = {};
			config = config || [];
			for(var i = 0; i < config.length; ++i)
				profile[config[i]] = 1;
			instance.load(profile);
		};
		
		this.submit = function(data) {
			data.append('musicgenres', JSON.stringify(instance.getSelection()));
		};
		
		this.getProfile = function() {
			return Object.keys(instance.getSelection()).map(Number);
		};
	};
	
	this.changeProfile = function(config) {
		for(var i = 0; i < instances.length; ++i)
			if('changeProfile' in instances[i])
				instances[i].changeProfile(config);
	};
}
