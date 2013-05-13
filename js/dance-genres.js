function DanceGenres(config, css, Button, Popup) {
	var buttonStates = 3;
	var accentuation = ['negative', '', 'positive'];
	
	this.forPlayer = function(parent, callback) {
		this.callback = callback;
		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Dance genres registered for this track')+'</legend>';

		this.display(container, config, buttonStates, true);
		this.disable();
	};
	this.forPlayer.inheritsFrom(forElement);
	
	this.forEditor = function(parent, callback) {
		this.callback = callback;
		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Dance genres to register for this track')+'</legend>';

		this.display(container, config, buttonStates, true);

		this.submit = function(data) {
			var danceGenres = {};
			for(var i in this.danceGenres)
				danceGenres[i] = this.danceGenres[i].value;
			data.append('dance-genres', JSON.stringify(danceGenres));
		};
	};
	this.forEditor.inheritsFrom(forElement);
	
	this.forPlaylist = function(playlist, parent, callback, css) {
		this.callback = callback;
		var columns = [];
		var popups = {};
		
		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Dance genres for the playlist')+'</legend>';
		
		this.display(container, config, buttonStates, false);
		
		for(var i = 0; i < playlist.model.fields.length; ++i)
			if(playlist.model.fields[i].id === 'dancegenre') {
				columns.push(i);
				css.removeClass(playlist.view.nodes.headerRow.children[i], 'undefined');
				css.addClass(playlist.view.nodes.headerRow.children[i], 'sp-list-cell-dancegenre');
				playlist.view.nodes.headerRow.children[i].childNodes[0].textContent = _('Dance genres');
				playlist.model.fields[i] = {id: 'dancegenre', title: _('Dance genres'), className: 'sp-list-cell-dancegenre', fixedWidth: 92, neededProperties: {track: ['danceGenres']}, get: function(a) {
						var div = TW.createElement('div', null, null, a.track.danceGenres.short);
						div.addEventListener('mouseover', function() {a.track.danceGenres.popup.showFor(div);});
						div.addEventListener('mouseout', function() {a.track.danceGenres.popup.hide();});
						return div;
					}
				};
			}
		
		this.updateTrack = function(track, danceGenres) {
			danceGenres = danceGenres === null ? [] : danceGenres.split(',');
			var exclude = [];
			var include = [];
			for(var danceGenre in this.danceGenres)
				if(danceGenres.indexOf(danceGenre) !== -1) {
					include.push(danceGenre);
					if(exclude.indexOf(this.danceGenres[danceGenre].parent) === -1)
						exclude.push(this.danceGenres[danceGenre].parent);
				}
			danceGenres = [];
			danceGenresShort = [];
			for(var i = 0; i < include.length; ++i) {
				danceGenres.push(this.danceGenres[include[i]].name);
				if(exclude.indexOf(include[i]) === -1)
					danceGenresShort.push(this.danceGenres[include[i]].short);
			}
			track.danceGenres = {name: danceGenres.join(', '), short: danceGenresShort.join(', ')};
			if(typeof popups[track.danceGenres.short] === 'undefined')
				popups[track.danceGenres.short] = Popup.withText(track.danceGenres.name);
			track.danceGenres.popup = popups[track.danceGenres.short];
		};

		this.submit = function(data) {
			var danceGenres = {};
			for(var i in this.danceGenres)
				if(this.danceGenres[i].value !== 0)
					danceGenres[i] = this.danceGenres[i].value;
			if(Object.keys(danceGenres).length > 0) {
				data.append('dance-genres', JSON.stringify(danceGenres));
				return true;
			}
			return false;
		};
	};
	this.forPlaylist.inheritsFrom(forElement);
	
	function forElement() {
		this.callback = null;
		this.danceGenres = {};
		getDanceGenres.call(this, config, 0);
		
		function getDanceGenres(danceGenres, parent) {
			for(var i = 0; i < danceGenres.length; ++i) {
				this.danceGenres[danceGenres[i][0]] = {value: 0, name: danceGenres[i][1], short: danceGenres[i][2], parent: parent, children: []};
				if(parent !== 0)
					this.danceGenres[parent].children.push(danceGenres[i][0]);
				getDanceGenres.call(this, danceGenres[i][3], danceGenres[i][0]);
			}
		}
		
		function markDanceGenre(danceGenre, value, current, markHierarchy) {
			if(value === 2 && this.danceGenres[danceGenre].value === -1)
				value = 0;
			if(value !== 2) {
				this.danceGenres[danceGenre].value = value;
				if(current)
					this.danceGenres[danceGenre].btn.setAccentuated(value !== -1, accentuation[(value+2) % 3]);
				else
					this.danceGenres[danceGenre].btn.setAccentuated(value !== 0, accentuation[value+1]);
			}
			if(markHierarchy) {
				if(value !== -1 && this.danceGenres[danceGenre].parent !== 0)
					markDanceGenre.call(this, this.danceGenres[danceGenre].parent, value === 0 ? 2 : value, false);
				if(value !== 1) {
					for(var i = 0; i < this.danceGenres[danceGenre].children.length; ++i)
						markDanceGenre.call(this, this.danceGenres[danceGenre].children[i], value, false);
				}
			}
		}

		this.load = function(config) {
			for(var danceGenre in this.danceGenres) {
				this.danceGenres[danceGenre].value = 0;
				this.danceGenres[danceGenre].btn.setAccentuated(false);
			}
			for(var danceGenre in config) {
				if(typeof this.danceGenres[danceGenre] !== 'undefined') {
					this.danceGenres[danceGenre].value = Math.round(config[danceGenre]);
					this.danceGenres[danceGenre].btn.setAccentuated(this.danceGenres[danceGenre].value !== 0, accentuation[this.danceGenres[danceGenre].value+1]);
				}
			}
		};
		
		this.enable = function() {
			for(var danceGenre in this.danceGenres)
				this.danceGenres[danceGenre].btn.setDisabled(false);
		};
		
		this.disable = function() {
			for(var danceGenre in this.danceGenres)
				this.danceGenres[danceGenre].btn.setDisabled(true);
		};
		
		this.display = function(container, danceGenres, states, markHierarchy) {
			states = states || 2;
			for(var i = 0; i < danceGenres.length; ++i) {
				var button = Button.withLabel(danceGenres[i][1]);
				button.genreId = danceGenres[i][0];
				button.node.addEventListener('click', (function(button, element, markHierarchy){return function() {
					markDanceGenre.call(element, button.genreId, ((element.danceGenres[button.genreId].value+states-1) % states)-states+2, true, markHierarchy);
					if(typeof element.callback === 'function')
						element.callback();
				};})(button, this, markHierarchy));

				button.node.addEventListener('mouseover', (function(button, element){return function() {
					button.setAccentuated(element.danceGenres[button.genreId].value !== -1, accentuation[(element.danceGenres[button.genreId].value+2) % 3]);
				};})(button, this));

				button.node.addEventListener('mouseout', (function(button, element){return function() {
					button.setAccentuated(element.danceGenres[button.genreId].value !== 0, accentuation[element.danceGenres[button.genreId].value+1]);
				};})(button, this));
				this.danceGenres[danceGenres[i][0]].btn = button;

				container.appendChild(button.node);
				if(danceGenres[i][3].length > 0) {
					css.addClass(button, 'parent');
					this.display(container, danceGenres[i][3], states, markHierarchy);
				}
			}
		};
	};
}
