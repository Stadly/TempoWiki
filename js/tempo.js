function Tempo(config, Throbber) {
	var echoNestAPIKey = 'JWR4RIYPCFCNWPMGD';
	var instances = [];
	var rangeMin = parseInt(config.config.rangeMin);
	var rangeMax = parseInt(config.config.rangeMax);
	var units = new Units(config.units);
	
	this.forPlayer = function(parent) {
		instances.push(this);
		var tempo = 0;
		
		var container = parent.appendChild(document.createElement('fieldset'));
		var tempoElm = container.appendChild(TW.createElement('span', {className: 'tempo',  content: _('Tempo:')+' '})).appendChild(document.createElement('span'));
		var throbber = Throbber.forElement(tempoElm);

		units.display(container, changeUnit);

		var xhr = null;
		this.load = function(config) {
			if(xhr !== null)
				xhr.abort();
			tempo = config.tempo || 0;
			update();
			if(typeof config.track !== 'undefined' && tempo === 0 && config.track.search(/^spotify:local:/) === -1) {
				throbber.show();
				xhr = new AjaxRequest
				(	'http://developer.echonest.com/api/v4/track/profile?api_key='+echoNestAPIKey+'&bucket=audio_summary&id='+config.track.replace(/^spotify:/, 'spotify-WW:')
				,	{	callback:
						function() {
							// Success fetching data from The Echo Nest
							var info = eval('('+this.responseText+');');
							if(info.response.track)
								tempo = info.response.track.audio_summary.tempo || 0;
							if(typeof config.echoNest === 'undefined')
								config.echoNest = {};
							config.echoNest.tempo = tempo;
							update();
						}
					,	error:
						function() {
							// Error fetching data from The Echo Nest
							console.log('Error fetching data from the Echo Nest');
							console.log(this);
							update();
						}
					}
				);
			}
		};
		
		function changeUnit() {
			if(xhr === null)
				update();
		}

		function update() {
			xhr = null;
			throbber.hide();
			tempoElm.innerText = Math.round(tempo * units.getMultiplier()) + ' ' + units.getUnit();
		}
	
		this.changeProfile = function(config) {
			container.style.display = config === null || config.display !== false ? '' : 'none';
		};
	};
	
	this.forEditor = function(parent) {
		instances.push(this);
		var prevTap = 0;
		var taps = [];
		var tempo = 0;

		var container = parent.appendChild(document.createElement('fieldset'));
		var tempoElm = container.appendChild(TW.createElement('span', {className: 'tempo', content: _('Tempo:')+' '})).appendChild(document.createElement('span'));

		units.display(container, update);
		
		var tapper = {};
		tapper.elm = container.appendChild(TW.createElement('div', {className: 'tap'}));
		tapper.elm.addEventListener('click', function(event){tap(event);});
		tapper.text = tapper.elm.appendChild(document.createElement('span'));
		tapper.status = TW.editStatus.NOT_EDITING;

		this.changeTrack = function(status) {
			tapper.status = status;
			switch(tapper.status) {
				case TW.editStatus.DIFFERENT:
					tapper.text.innerText = _('The track being edited must be playing in order to calculate the tempo');
					break;
				case TW.editStatus.NOT_PLAYING:
					tapper.text.innerText = _('The track must be playing in order to calculate the tempo');
					break;
				case TW.editStatus.NOT_EDITING:
					tapper.text.innerText = _('No track is currently being edited');
					break;
				case TW.editStatus.OK:
					tapper.text.innerText = _('Click the beat with your mouse here to calculate the tempo');
					break;
			}
		};

		this.load = function(config) {
			prevTap = 0;
			taps = [];
			tempo = config.tempo || (typeof config.echoNest !== 'undefined' ? config.echoNest.tempo || 0 : 0);
			update();
		};

		this.submit = function(data) {
			if(container.style.display !== 'none')
				data.append('tempo', tempo);
		};
		
		this.enable = function() {
			tapper.elm.style.display = '';
		};
		
		this.disable = function() {
			tapper.elm.style.display = 'none';
		};

		function tap(event) {
			if(tapper.status === TW.editStatus.OK) {
				if(prevTap > 0) {
					taps.push(event.timeStamp - prevTap);
					taps.sort(function(a,b){return a-b;});
				}

				prevTap = event.timeStamp;
				update();
			}
		}

		function update() {
			if(taps.length > 0) {
				var center = Math.floor(taps.length/2);
				tempo = taps[center];
				var tapCount = 1;
				var treshold = 2*taps[center]/taps.length;

				for(var i = 1; center-i >= 0 && taps[center]-taps[center-i] < treshold; ++i, tapCount++)
					tempo += taps[center-i];
				for(var i = 1; center+i < taps.length && taps[center+i]-taps[center] < treshold; ++i, tapCount++)
					tempo += taps[center+i];
				tempo = 60000 / (tempo/tapCount);
			}
			tempoElm.innerText = Math.round(tempo * units.getMultiplier()) + ' ' + units.getUnit();
		}
	
		this.changeProfile = function(config) {
			container.style.display = config === null || config.display !== false ? '' : 'none';
		};
	};
	
	this.forPlaylist = function(playlist, sorting, parent, callback, css) {
		instances.push(this);
		var columns = [];

		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Tempo for the playlist')+'</legend>';
		
		var range = new Range(container, rangeMin, rangeMax, callback);
		units.display(container, function(){range.update();updatePlaylist();});
		sorting.tempo = [true, function(a,b,asc){numA = parseFloat(a.tempo); numB = parseFloat(b.tempo); return (numA === 0 || numB === 0) && asc ? numB-numA : numA-numB;}];
		
		this.updateTrack = function(track, tempo) {
			track.tempo = tempo || '0';
		};

		this.submit = function(data) {
			var tempo = {};
			var changed = false;
			if(range.getMin() !== rangeMin) {
				tempo.min = range.getMin();
				changed = true;
			}
			if(range.getMax() !== rangeMax) {
				tempo.max = range.getMax();
				changed = true;
			}
			data.append('tempo', JSON.stringify(tempo));
			return changed;
		};
		
		function updatePlaylist() {
			for(var j = 0; j < columns.length; ++j)
				for(var i = 0; i < playlist.model.items.length; ++i)
					playlist.view.rows[i].children[columns[j]].innerText = playlist.model.items[i].tempo !== '0' ? Math.round(playlist.model.items[i].tempo*units.getMultiplier()) : '';
		}
	
		this.changeProfile = function(config) {
			// TODO: Remove tempo-column from playlist if tempo should not be shown
			container.style.display = config === null || config.display !== false ? '' : 'none';
			range.updateRange(config === null ? null : config.min || null, config === null ? null : config.max || null);
		};
		
		this.setPlaylist = function(list) {
			playlist = list;
			for(var i = 0; i < playlist.model.fields.length; ++i)
				if(playlist.model.fields[i].id === 'tempo') {
					columns.push(i);
					css.removeClass(playlist.view.nodes.headerRow.children[i], 'undefined');
					css.addClass(playlist.view.nodes.headerRow.children[i], 'sp-list-cell-tempo');
					playlist.view.nodes.headerRow.children[i].childNodes[0].textContent = _('Tempo');
					playlist.model.fields[i] = {id: 'tempo', title: _('Tempo'), className: 'sp-list-cell-tempo', fixedWidth: 59, neededProperties: {track: ['tempo']}, get: function(a){return a.track.tempo !== '0' ? ''+Math.round(a.track.tempo*units.getMultiplier()) : '';}};
				}
		};
		
		this.setPlaylist(playlist);
	};
	
	this.forProfiler = function(parent) {
		instances.push(this);
		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Applicable tempo interval')+'</legend>';
		
		var range = new Range(container, rangeMin, rangeMax);
		units.display(container, range.update);
		
		this.changeProfile = function(config) {
			range.load({min: (config || {}).min || rangeMin, max: (config || {}).max || rangeMax});
		};
	};
	
	this.changeProfile = function(config) {
		units.changeProfile(config === null ? null : config.units || null);
		for(var i = 0; i < instances.length; ++i)
			if(typeof instances[i].changeProfile !== 'undefined')
				instances[i].changeProfile(config);
	};
	
	function Range(container, rangeMin, rangeMax, callback) {
		var rangeWidth = 350;
		var orgMin = rangeMin;
		var orgMax = rangeMax;
		var range = container.appendChild(TW.createElement('div', {className: 'range'}));
		range.style.width = rangeWidth + 'px';
		var track = range.appendChild(TW.createElement('div', {className: 'track'}));
		var marked = track.appendChild(TW.createElement('div', {className: 'marked'}));

		var min = new Handle('min');
		var max = new Handle('max');
		min.setValue(rangeMin);
		max.setValue(rangeMax);

		this.getMin = function(){return min.getValue();};
		this.getMax = function(){return max.getValue();};
		
		this.update = function() {
			min.update();
			max.update();
		};
		
		this.load = function(config) {
			if(typeof config.min !== 'undefined')
				min.setValue(config.min);
			if(typeof config.max !== 'undefined')
				max.setValue(config.max);
		};

		this.updateRange = function(rMin, rMax) {
			rangeMin = rMin === null ? orgMin : rMin;
			rangeMax = rMax === null ? orgMax : rMax;
			changed = false;
			if(rangeMin > min.getValue()) {
				min.setValue(rangeMin);
				if(rangeMin > max.getValue())
					max.setValue(rangeMin);
				changed = true;
			}
			if(rangeMax < max.getValue()) {
				max.setValue(rangeMax);
				if(rangeMax < min.getValue())
					min.setValue(rangeMax);
				changed = true;
			}
			this.update();
			if(changed && typeof callback === 'function')
				callback();
		};

		track.addEventListener('mousedown', function(e) {
			var handleOffset = 11;
			var offset = track.offsetLeft+handleOffset;
			var lower = parseInt(marked.style.left || 0);
			var upper = lower+parseInt(marked.style.width || rangeWidth);
			var pos = e.x-offset;
			var handle;
			if(pos < lower || Math.abs(lower-pos) < Math.abs(upper-pos)) {
				handle = min;
				lower = 0;
			} else {
				handle = max;
				upper = rangeWidth;
			}
			function move(e) {
				handle.setValue(Math.round(Math.min(Math.max(e.x-offset, lower), upper)/rangeWidth*(rangeMax-rangeMin)+rangeMin));
			}
			move(e);
			document.addEventListener('mousemove', move);
			document.addEventListener('mouseup', function() {
				this.removeEventListener('mouseup', arguments.callee);
				this.removeEventListener('mousemove', move);
				if(typeof callback === 'function')
					callback();
			});
		});

		function Handle(type) {
			marked.appendChild(TW.createElement('div', {className: 'handle '+type}));
			var elm = range.appendChild(TW.createElement('div', {className: type}));
			var value = 0;

			this.update = function() {
				elm.innerText = Math.round(value*units.getMultiplier());
				var rangeInterval = rangeMax-rangeMin;
				var rangePortion = rangeWidth/rangeInterval;
				switch(type) {
					case 'min':
						marked.style.left = ((value-rangeMin)*rangePortion)+'px';
						marked.style.width = ((max.getValue()-value)*rangePortion)+'px';
						break;
					case 'max':
						marked.style.width = ((value-min.getValue())*rangePortion)+'px';
						break;
				}
			};
			
			this.getValue = function(){return value;};
			
			this.setValue = function(val) {
				value = val;
				this.update();
			};
		}
	}
	
	function Units(config) {
		var callback = [];
		var units = [];
		var instances = [];
		var current = null;
		
		for(var i = 0; i < config.length; ++i)
			units.push(new Unit(config[i][0], config[i][1], config[i][2], config[i][3]));
		if(units.length === 0)
			units.push(new Unit(0, 1, '', ''));
		current = units[0];
		
		this.getUnit = function(){return current.getUnit();};
		this.getMultiplier = function(){return current.getMultiplier();};
		
		this.display = function(container, func) {
			if(typeof func === 'function')
				callback.push(func);
			
			var ul = container.appendChild(TW.createElement('ul', {className: 'units'}));
			if(units.length < 2)
				ul.style.display = 'none';

			for(var i = 0; i < units.length; ++i)
				units[i].display(ul);
			
			instances.push(ul);
			select(current);
		};
		
		function select(unit) {
			current = unit;
			current.select();
			for(var i = 0; i < callback.length; ++i)
				callback[i]();
		}
		
		this.changeProfile = function(config) {
			for(var i = 0; i < instances.length; ++i)
				instances[i].style.display = (config === null && units.length > 1) || config.length > 1 ? '' : 'none';
			for(var i = 0; i < units.length; ++i)
				units[i].show(config === null || config.indexOf(units[i].getId()) !== -1);
			if(config !== null) {
				var current = null;
				if(config.length > 0)
					for(var i = 0; i < units.length && current === null; ++i)
						if(units[i].getId() === config[0])
							current = units[i];
				select(current || units[0]);
			}
		};
		
		function Unit(id, multiplier, name, unit) {
			var self = this;
			var elms = [];
			
			this.getId = function(){return id;};
			this.getUnit = function(){return unit;};
			this.getMultiplier = function(){return multiplier;};
			
			this.display = function(container) {
				var li = container.appendChild(TW.createElement('li', {id: 'li-unit-'+instances.length+'-'+id}));
				var input = li.appendChild(TW.createElement('input', {id: 'unit-'+instances.length+'-'+id, type: 'radio', name: 'unit', value: multiplier}));
				input.addEventListener('click', function(){select(self);});
				li.appendChild(TW.createElement('label', {'for': 'unit-'+instances.length+'-'+id, content: ' '+name}));
				elms.push([li, input]);
			};
			this.select = function() {
				for(var i = 0; i < elms.length; ++i)
					elms[i][1].checked = true;
			};
			this.show = function(show) {
				for(var i = 0; i < elms.length; ++i)
					elms[i][0].style.display = show ? '' : 'none';
			};
		}
	}
}