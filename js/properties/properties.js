(function() {
	var Properties = {};
	var properties =
		{	dancegenres:	Dancegenres
		,	musicgenres:	Musicgenres
		,	tempo:			Tempo
		};
	
	Properties.instantiate = function(config, css, Button, Throbber, Popup) {
		for(var property in properties)
			if(properties.hasOwnProperty(property))
				properties[property] = new properties[property](config[property], css, Button, Throbber, Popup);
	};
	
	Properties.forPlayer = function(form) {
		var forPlayer = new PropertyCollection();
		for(var property in properties)
			if(properties.hasOwnProperty(property))
				forPlayer.addProperty(property, new properties[property].forPlayer(form));
		return forPlayer;
	};
	
	Properties.forEditor = function(form) {
		var forEditor = new PropertyCollection();
		for(var property in properties)
			if(properties.hasOwnProperty(property))
				forEditor.addProperty(property, new properties[property].forEditor(form));
		return forEditor;
	};
	
	Properties.forPlaylist = function(sorting, form, update) {
		var forPlaylist = new PropertyCollection();
		for(var property in properties)
			if(properties.hasOwnProperty(property))
				forPlaylist.addProperty(property, new properties[property].forPlaylist(sorting, form, update));
		return forPlaylist;
	};
	
	Properties.forProfiler = function(form, submit, func) {
		var forProfiler = new PropertyCollection();
		for(var property in properties)
			if(properties.hasOwnProperty(property))
				forProfiler.addProperty(property, new properties[property].forProfiler(form, submit, func));
		return forProfiler;
	};
		
	Properties.changeProfile = function(config) {
		for(var property in properties)
			if(properties.hasOwnProperty(property))
				properties[property].changeProfile(config.properties[property] || null);
	};
	
	window.Properties = Properties;
	
	function PropertyCollection() {
		var properties = {};
		
		this.addProperty = function(name, property) {
			properties[name] = property;
		};
		
		this.enable = function() {
			for(var property in properties)
				if(properties.hasOwnProperty(property))
					properties[property].enable();
		};
		
		this.disable = function() {
			for(var property in properties)
				if(properties.hasOwnProperty(property))
					properties[property].disable();
		};
		
		this.submit = function(data) {
			var changed = false;
			for(var property in properties)
				if(properties.hasOwnProperty(property))
					changed |= properties[property].submit(data);
			return changed;
		};
		
		this.changeTrack = function(status) {
			for(var property in properties)
				if(properties.hasOwnProperty(property))
					if(typeof properties[property].changeTrack === 'function')
						properties[property].changeTrack(status);
		};
		
		this.updateTrack = function(track, config) {
			track.properties = {};
			for(var property in properties)
				if(properties.hasOwnProperty(property))
					track.properties[property] = properties[property].updateTrack(config[property]);
		};
		
		this.load = function(config) {
			for(var property in properties)
				if(properties.hasOwnProperty(property)) {
					if(!(property in config))
						config[property] = {};
					properties[property].load(config[property]);
				}
		};
		
		this.setPlaylist = function(list) {
			for(var property in properties)
				if(properties.hasOwnProperty(property))
					properties[property].setPlaylist(list);
		};
		
		this.getProfile = function(profile) {
			for(var property in properties)
				if(properties.hasOwnProperty(property))
					profile[property] = properties[property].getProfile();
		};
		
		this.compareMetadata = function(metadata1, metadata2) {
			for(var property in properties)
				if(properties.hasOwnProperty(property))
					if(typeof metadata1 !== 'undefined' && !properties[property].compareMetadata(metadata1[property] || {}, metadata2[property] || {}))
						return false;
			return true;
		};
		
		this.playlistName = function() {
			var name = [];
			for(var property in properties)
				if(properties.hasOwnProperty(property))
					name.push(properties[property].playlistName());
			return name.join('/');
		};
	}
})();