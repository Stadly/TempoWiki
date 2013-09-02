function Tempo(config, Button, Throbber) {
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
			if(config.hasOwnProperty('track') && tempo === 0 && config.track.search(/^spotify:local:/) === -1) {
				throbber.show();
				xhr = new AjaxRequest
				(	'http://developer.echonest.com/api/v4/track/profile?api_key='+echoNestAPIKey+'&bucket=audio_summary&id='+config.track.replace(/^spotify:/, 'spotify-WW:')
				,	{	callback:
						function() {
							// Success fetching data from The Echo Nest
							var info = eval('('+this.responseText+');');
							if(info.response.track)
								tempo = info.response.track.audio_summary.tempo || 0;
							if(!config.hasOwnProperty('echoNest'))
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
			container.style.display = config === null || config.units.length > 0 ? '' : 'none';
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
			tempo = config.tempo || (config.hasOwnProperty('echoNest') ? config.echoNest.tempo || 0 : 0);
			update();
		};

		this.submit = function(data) {
			if(container.style.display !== 'none')
				data.append('tempo', JSON.stringify({tempo: tempo}));
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
			container.style.display = config === null || config.units.length > 0 ? '' : 'none';
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
			var submit = range.submit();
			data.append('tempo', JSON.stringify(submit));
			return Object.getOwnPropertyNames(submit).length > 0;
		};
		
		function updatePlaylist() {
			for(var j = 0; j < columns.length; ++j)
				for(var i = 0; i < playlist.model.items.length; ++i)
					playlist.view.rows[i].children[columns[j]].innerText = 'tempo' in playlist.model.items[i] && typeof playlist.model.items[i].tempo !== 'undefined' && playlist.model.items[i].tempo !== '0' ? Math.round(playlist.model.items[i].tempo*units.getMultiplier()) : '';
		}
	
		this.changeProfile = function(config) {
			// TODO: Remove tempo-column from playlist if tempo should not be shown
			container.style.display = config === null || config.units.length > 0 ? '' : 'none';
			
			var resetMin = range.getMin() === range.getRangeMin();
			var resetMax = range.getMax() === range.getRangeMax();
			range.updateRange(config === null ? null : config.min || null, config === null ? null : config.max || null);
			
			var reset = {};
			if(resetMin)
				reset.min = range.getRangeMin();
			if(resetMax)
				reset.max = range.getRangeMax();
			range.load(reset);
		};
		
		this.setPlaylist = function(list) {
			playlist = list;
			for(var i = 0; i < playlist.model.fields.length; ++i)
				if(playlist.model.fields[i].id === 'tempo') {
					columns.push(i);
					css.removeClass(playlist.view.nodes.headerRow.children[i], 'undefined');
					css.addClass(playlist.view.nodes.headerRow.children[i], 'sp-list-cell-tempo');
					playlist.view.nodes.headerRow.children[i].childNodes[0].textContent = _('Tempo');
					playlist.model.fields[i] = {id: 'tempo', title: _('Tempo'), className: 'sp-list-cell-tempo', fixedWidth: 59, neededProperties: {track: ['tempo']}, get: function(a){return typeof a.track.tempo !== 'undefined' && a.track.tempo !== '0' ? ''+Math.round(a.track.tempo*units.getMultiplier()) : '';}};
				}
		};
		
		this.setPlaylist(playlist);
	};
	
	this.forProfiler = function(parent, submit, callback) {
		instances.push(this);
		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Applicable tempo interval')+'</legend>';
		
		var range = new Range(container, rangeMin, rangeMax, submit);
		units.display
			(	container
			,	function() {
					range.update();
					// Save default unit when unit is changed
					if(typeof callback === 'function')
						callback(units.getId());
				}
			,	function() {
					// Save units when changed in Profiler
					if(typeof submit === 'function')
						submit();
			}
			,	true
			);
		
		this.submit = function(data) {
			data.append('tempo', JSON.stringify(
				{	range: range.submit()
				,	units: units.submit()
				}
			));
		};
		
		this.changeProfile = function(config) {
			range.load({min: (config || {}).min || rangeMin, max: (config || {}).max || rangeMax});
		};
		
		this.getProfile = function() {
			var profile =
				{	min:		range.getMin()
				,	max:		range.getMax()
				,	units:	units.getProfile()
				};
			return profile;
		};
	};
	
	this.changeProfile = function(config) {
		units.changeProfile(config === null ? null : config.units || null);
		for(var i = 0; i < instances.length; ++i)
			if('changeProfile' in instances[i])
				instances[i].changeProfile(config);
	};
	
	function Range(container, rangeMin, rangeMax, callback) {
		var self = this;
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
		this.getRangeMin = function(){return rangeMin;};
		this.getRangeMax = function(){return rangeMax;};
		
		this.update = function() {
			min.update();
			max.update();
		};
		
		this.load = function(config) {
			if(config.hasOwnProperty('min'))
				min.setValue(config.min);
			if(config.hasOwnProperty('max'))
				max.setValue(config.max);
		};

		this.submit = function() {
			var tempo = {};
			if(self.getMin() !== self.getRangeMin())
				tempo.min = self.getMin();
			if(self.getMax() !== self.getRangeMax())
				tempo.max = self.getMax();
			return tempo;
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
		var btnCallback = [];
		var units = [];
		var instances = [];
		var current = null;
		
		for(var i = 0; i < config.length; ++i)
			units.push(new Unit(config[i][0], config[i][1], config[i][2], config[i][3]));
		if(units.length === 0)
			units.push(new Unit(0, 1, '', ''));
		current = units[0];
		
		this.getId = function(){return current.getId();};
		this.getUnit = function(){return current.getUnit();};
		this.getMultiplier = function(){return current.getMultiplier();};
		
		this.display = function(container, func, btnFunc, asButtons) {
			if(typeof func === 'function')
				callback.push(func);
			if(typeof btnFunc === 'function')
				btnCallback.push(btnFunc);
			
			var ul = container.appendChild(TW.createElement('ul', {className: 'units'}));
			if(!asButtons && units.length < 2)
				ul.style.display = 'none';

			for(var i = 0; i < units.length; ++i)
				units[i].display(ul, asButtons);
			
			instances.push([ul, asButtons]);
			select(current);
		};
		
		function select(unit, asButtons) {
			if(!asButtons) {
				current = unit;
				current.select();
			} else {
				for(var i = 0; i < btnCallback.length; ++i)
					btnCallback[i]();
			}
			for(var i = 0; i < callback.length; ++i)
				callback[i]();
		}
		
		this.changeProfile = function(config) {
			for(var i = 0; i < instances.length; ++i)
				instances[i][0].style.display = (config === null && units.length > 1) || config.length > 1 || instances[i][1] ? '' : 'none';
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
		
		this.submit = function() {
			var submit = {};
			for(var i = 0; i < units.length; ++i) {
				var unit = units[i].submit();
				if(unit)
					submit[unit] = current.getId() === unit ? 1 : 0;
			}
			return submit;
		};
		
		this.getProfile = function() {
			var profile = [];
			for(var i = 0; i < units.length; ++i) {
				var unit = units[i].submit();
				if(typeof unit !== 'undefined') {
					if(unit === current.getId())
						profile.unshift(unit);
					else
						profile.push(unit);
				}
			}
			return profile;
		};
		
		function Unit(id, multiplier, name, unit) {
			var self = this;
			var elms = [];
			var buttons = [];
			
			this.getId = function(){return id;};
			this.getUnit = function(){return unit;};
			this.getMultiplier = function(){return multiplier;};
			
			this.display = function(container, asButtons) {
				var li = container.appendChild(TW.createElement('li', {id: 'li-unit-'+instances.length+'-'+id}));
				if(asButtons) {
					var i = buttons.length;
					var button = Button.withLabel(name);
					button.setSize('small');
					li.appendChild(button.node);
					buttons[i] = [button, false];
					button.node.addEventListener('click', function() {
						buttons[i][1] = !buttons[i][1];
						button.setAccentuated(buttons[i][1]);
						select(self, true);
					});
				} else {
					var input = li.appendChild(TW.createElement('input', {id: 'unit-'+instances.length+'-'+id, type: 'radio', name: 'unit', value: multiplier}));
					input.addEventListener('click', function(){select(self);});
					li.appendChild(TW.createElement('label', {'for': 'unit-'+instances.length+'-'+id, content: ' '+name}));
					elms.push([li, input]);
				}
			};
			this.select = function() {
				for(var i = 0; i < elms.length; ++i)
					elms[i][1].checked = true;
			};
			this.show = function(show) {
				for(var i = 0; i < elms.length; ++i)
					elms[i][0].style.display = show ? '' : 'none';
				for(var i = 0; i < buttons.length; ++i) {
					buttons[i][0].setAccentuated(show);
					buttons[i][1] = show;
				}
			};
			this.submit = function() {
				for(var i = 0; i < buttons.length; ++i)
					if(buttons[i][1])
						return id;
			};
		}
	}
}