function BPM(config, Throbber) {
	var units = new Units(config.units);
	
	this.forPlayer = function(parent) {
		var bpm = 0;
		
		var container = parent.appendChild(document.createElement('fieldset'));
		var bpmElm = container.appendChild(TW.createElement('span', null, 'bpm',  _('Tempo:')+' ')).appendChild(document.createElement('span'));
		var throbber = Throbber.forElement(bpmElm);

		units.display(container, changeUnit);

		var xhr;
		this.load = function(config) {
			if(typeof xhr !== 'undefined')
				xhr.abort();
			bpm = config.bpm || 0;
			update();
			if(typeof config.track !== 'undefined' && bpm === 0 && config.track.search(/^spotify:local:/) === -1) {
				throbber.show();
				xhr = new AjaxRequest
				(	'http://developer.echonest.com/api/v4/track/profile?api_key=JWR4RIYPCFCNWPMGD&bucket=audio_summary&id='+config.track.replace(/^spotify:/, 'spotify-WW:')
				,	function() {
						// Success registering info
						var info = eval('('+this.responseText+');');
						if(info.response.track)
							bpm = info.response.track.audio_summary.tempo || 0;
						if(typeof config.echoNest === 'undefined')
							config.echoNest = {};
						config.echoNest.bpm = bpm;
						update();
					}
				,	function() {
						// Error registering info
					}
				);
			}
		};
		
		function changeUnit() {
			if(typeof xhr === 'undefined')
				update();
		}

		function update() {
			throbber.hide();
			bpmElm.innerText = Math.round(bpm * units.getMultiplier()) + ' ' + units.getUnit();
		}
	};
	
	this.forEditor = function(parent) {
		var prevTap = 0;
		var taps = [];
		var bpm = 0;

		var container = parent.appendChild(document.createElement('fieldset'));
		var bpmElm = container.appendChild(TW.createElement('span', null, 'bpm', _('Tempo:')+' ')).appendChild(document.createElement('span'));

		units.display(container, update);
		
		var tapper = {};
		tapper.elm = container.appendChild(TW.createElement('div', null, 'tap'));
		tapper.elm.addEventListener('click', function(event) {tap(event);});
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
			bpm = config.bpm || (typeof config.echoNest !== 'undefined' ? config.echoNest.bpm || 0 : 0);
			update();
		};

		this.submit = function(data) {
			data.append('bpm', bpm);
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
				bpm = taps[center];
				var tapCount = 1;
				var treshold = 2*taps[center]/taps.length;

				for(var i = 1; center-i >= 0 && taps[center]-taps[center-i] < treshold; ++i, tapCount++)
					bpm += taps[center-i];
				for(var i = 1; center+i < taps.length && taps[center+i]-taps[center] < treshold; ++i, tapCount++)
					bpm += taps[center+i];
				bpm = 60000 / (bpm/tapCount);
			}
			bpmElm.innerText = Math.round(bpm * units.getMultiplier()) + ' ' + units.getUnit();
		}
	};
	
	this.forPlaylist = function(playlist, sorting, parent, callback, css) {
		var min = {};
		var max = {};
		var columns = [];

		var container = parent.appendChild(document.createElement('fieldset'));
		container.innerHTML = '<legend>'+_('Tempo for the playlist')+'</legend>';

		var rangeWidth = 350;
		var rangeMin = 0;
		var rangeMax = 400;
		
		var range = container.appendChild(TW.createElement('div', null, 'range'));
		range.style.width = rangeWidth + 'px';
		var track = range.appendChild(TW.createElement('div', null, 'track'));
		var marked = track.appendChild(TW.createElement('div', null, 'marked'));
		marked.appendChild(TW.createElement('div', null, 'handle min'));
		min.elm = range.appendChild(TW.createElement('div', null, 'min'));
		min.value = rangeMin;
		min.change = function(value, lower, upper) {marked.style.left = value+'px'; marked.style.width = (upper-value)+'px';};
		marked.appendChild(TW.createElement('div', null, 'handle max'));
		max.elm = range.appendChild(TW.createElement('div', null, 'max'));
		max.value = rangeMax;
		max.change = function(value, lower, upper) {marked.style.width = (value-lower)+'px';};

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
				value = Math.min(Math.max(e.x-offset, lower), upper);
				handle.change(value, lower, upper);
				handle.value = Math.round(value/rangeWidth*(rangeMax-rangeMin)+rangeMin);
				updateRange();
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
		
		units.display(container, function(){updateRange();updatePlaylist();});
		
		sorting.bpm = [true, function(a,b,asc){numA = parseFloat(a.bpm); numB = parseFloat(b.bpm); return (numA === 0 || numB === 0) && asc ? numB-numA : numA-numB;}];
		for(var i = 0; i < playlist.model.fields.length; ++i)
			if(playlist.model.fields[i].id === 'bpm') {
				columns.push(i);
				css.removeClass(playlist.view.nodes.headerRow.children[i], 'undefined');
				css.addClass(playlist.view.nodes.headerRow.children[i], 'sp-list-cell-bpm');
				playlist.view.nodes.headerRow.children[i].childNodes[0].textContent = _('Tempo');
				playlist.model.fields[i] = {id: 'bpm', title: _('Tempo'), className: 'sp-list-cell-bpm', fixedWidth: 59, neededProperties: {track: ['bpm']}, get: function(a){return a.track.bpm !== '0' ? ''+Math.round(a.track.bpm*units.getMultiplier()) : '';}};
			}
		
		this.updateTrack = function(track, bpm) {
			track.bpm = bpm || '0';
		};

		this.submit = function(data) {
			if(min.value !== rangeMin || max.value !== rangeMax) {
				if(min.value !== rangeMin)
					data.append('bpm-min', min.value);
				if(max.value !== rangeMax)
					data.append('bpm-max', max.value);
				return true;
			}
			return false;
		};

		function updateRange() {
			min.elm.innerText = Math.round(min.value*units.getMultiplier());
			max.elm.innerText = Math.round(max.value*units.getMultiplier());
		}
		
		function updatePlaylist() {
			for(var j = 0; j < columns.length; ++j)
				for(var i = 0; i < playlist.model.items.length; ++i)
					playlist.view.rows[i].children[columns[j]].innerText = playlist.model.items[i].bpm !== '0' ? Math.round(playlist.model.items[i].bpm*units.getMultiplier()) : '';
		}
	};
	
	function Units(config) {
		var id;
		var name = '';
		var unit = '';
		var multiplier = 1;
		var elms = [];
		var callback = [];
		var displayCount = 0;
		
		this.getName = function() {
			return name;
		};
		
		this.getUnit = function() {
			return unit;
		};
		
		this.getMultiplier = function() {
			return multiplier;
		};
		
		this.display = function(container, func) {
			if(typeof func === 'function')
				callback.push(func);
			
			var ul = container.appendChild(document.createElement('ul'));
			ul.className = 'units';

			for(var i = 0; i < config.length; ++i) {
				var li = ul.appendChild(document.createElement('li'));

				var input = li.appendChild(document.createElement('input'));
				input.id = 'unit-'+displayCount+'-'+config[i][0];
				input.type = 'radio';
				input.name = 'unit';
				input.value = config[i][1];
				input.dataset.id = config[i][0];
				input.dataset.name = config[i][2];
				input.dataset.unit = config[i][3];
				input.addEventListener('click', function(event){update(event.target);});
				if(!(config[i][0] in elms))
					elms[config[i][0]] = [];
				elms[config[i][0]].push(input);
				if(typeof id === 'undefined')
					update(input);

				var label = li.appendChild(document.createElement('label'));
				label.setAttribute('for', 'unit-'+displayCount+'-'+config[i][0]);
				label.appendChild(document.createTextNode(' '+config[i][2]));
			}
			update();
			displayCount++;
		};
		
		function update(elm) {
			if(typeof elm !== 'undefined') {
				id = elm.dataset.id;
				name = elm.dataset.name;
				unit = elm.dataset.unit;
				multiplier = elm.value;
			}
			for(var i = 0; i < elms[id].length; ++i)
				elms[id][i].checked = true;
			for(var i = 0; i < callback.length; ++i)
				callback[i]();
		}
	}
}