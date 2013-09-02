function Profiler(profiles, css, TabBar) {
	var btnNew, xhrActive;
	var active = false;
	var xhrRegister = [];
	var xhrDefaultUnit = [];
	
	var tabBar = TabBar.withTabs([], {sticky: false});
	tabBar.addToDom(document.getElementById('header'), 'after');
	tabBar.contentNode.insertBefore(TW.createElement('span', {content: _('Profiles: ')}), tabBar.contentNode.firstChild);
	tabBar.addEventListener('tabchange', changeProfile);

	var container = TW.createTab('profiler');
	var form = container.appendChild(document.createElement('form'));
	var dancegenres = new Dancegenres.forProfiler(form, submit);
	var musicgenres = new Musicgenres.forProfiler(form, submit);
	var tempo = new Tempo.forProfiler(form, submit, function(unit) {
		if(active !== false && profiles[active].profile !== 0) {
			var id = active;
			if(typeof xhrDefaultUnit[id] !== 'undefined')
				xhrDefaultUnit[id].abort();

			var data = new FormData();
			data.append('profile', profiles[id].profile);
			data.append('unit', unit);
			profiles[id].tempo = tempo.getProfile();

			xhrDefaultUnit[id] = new AjaxRequest
			(	SERVER+'profiler/default-unit.php'
			,	{	callback:
					function() {
						// Success registering default unit
						delete xhrDefaultUnit[id];
					}
				,	error:
					function() {
						// Error registering default unit
						delete xhrRegister[id];
						console.log('Error registering default unit');
						console.log(this);
					}
				}
			,	data
			);
		}
	});
	
	for(var i = 0; i < profiles.length; ++i) {
		profiles[i].dancegenres = profiles[i].dancegenres === null ? [] : profiles[i].dancegenres.split(',');
		profiles[i].musicgenres = profiles[i].musicgenres === null ? [] : profiles[i].musicgenres.split(',');
		profiles[i].tempo =
			{	min: profiles[i].tempoMin
			,	max: profiles[i].tempoMax
			,	units: profiles[i].units === null ? [] : profiles[i].units.split(',').map(Number)
			};
		profiles[i].active = profiles[i].active === '1';
		active |= profiles[i].active;
		displayProfile(i);
	}
	if(profiles.length === 0) {
		newProfile();
		tabBar.contentNode.removeChild(input);
	} else if(!active)
		tabBar.setActiveTab('0');
	
	function changeProfile(e) {
		active = e.id;
		Tempo.changeProfile(profiles[active].tempo || null);
		Dancegenres.changeProfile(profiles[active].dancegenres || null);
		Musicgenres.changeProfile(profiles[active].musicgenres || null);
		if(profiles[active].profile !== 0) {
			if(typeof xhrActive !== 'undefined')
				xhrActive.abort();
			
			var data = new FormData();
			data.append('profile', profiles[active].profile);

			xhrActive = new AjaxRequest
			(	SERVER+'profiler/active.php'
			,	{	callback:
					function() {
						delete xhrActive;
						// Success registering active profile
					}
				,	error:
					function() {
						// Error registering active profile
						delete xhrActive;
						console.log('Error registering default unit');
						console.log(this);
					}
				}
			,	data
			);
		}
	}
	
	function displayProfile(profile) {
		tabBar.addTab({id: profile, name: profiles[profile].name});
		profiles[profile].button = tabBar.contentNode.lastChild;
		if(profiles[profile].active)
			tabBar.setActiveTab(''+profile);
		profiles[profile].button.appendChild(TW.createElement('span', {className: 'admin-icon profile-edit'})).addEventListener('click', renameProfile);
		profiles[profile].button.appendChild(TW.createElement('span', {className: 'admin-icon profile-delete'})).addEventListener('click', deleteProfile);
		
		if(typeof btnNew !== 'undefined')
			tabBar.contentNode.removeChild(btnNew);
			
		btnNew = tabBar.contentNode.appendChild(TW.createElement('span', {className: 'admin-icon profile-new'}));
		btnNew.addEventListener('click', newProfile);
	}
	
	function submit() {
		if(active !== false && profiles[active].profile !== 0) {
			var id = active;
			if(typeof xhrRegister[id] !== 'undefined')
				xhrRegister[id].abort();

			var data = new FormData();
			data.append('profile', profiles[id].profile);
			tempo.submit(data);
			profiles[id].tempo = tempo.getProfile();
			dancegenres.submit(data);
			profiles[id].dancegenres = dancegenres.getProfile();
			musicgenres.submit(data);
			profiles[id].musicgenres = musicgenres.getProfile();
			changeProfile({id: id});

			xhrRegister[id] = new AjaxRequest
			(	SERVER+'profiler/register.php'
			,	{	callback:
					function() {
						// Success registering profile
						delete xhrRegister[id];
					}
				,	error:
					function() {
						// Error registering profile
						delete xhrRegister[id];
						console.log('Error registering profile');
						console.log(this);
					}
				}
			,	data
			);
		}
	}
	
	function newProfile() {
		var id = profiles.length;
		profiles[id] =
			{	profile:		0
			,	name:			_('New profile')
			,	active:		true
			,	dancegenres:	[]
			,	musicgenres:	[]
			,	tempo:			{}
			};
		displayProfile(id);
		renameProfile();

		var data = new FormData();
		data.append('name', profiles[id].name);
		new AjaxRequest
		(	SERVER+'profiler/create.php'
		,	{	callback:
				function() {
					// Success creating profile
					profiles[id].profile = this.responseText;
				}
			,	error:
				function() {
					// Error creating profile
					console.log('Error creating profile');
					console.log(this);
				}
			}
			,	data
		);
	}
	
	var input;
	var xhrRename = [];
	function renameProfile() {
		var id = active;
		var button = profiles[id].button;
		input = tabBar.contentNode.insertBefore(TW.createElement('input', {value: profiles[id].name, className: 'button-input'}), button);
		var style = document.defaultView.getComputedStyle(button, null);
		input.style.fontFamily = style.getPropertyValue('font-family');
		input.style.fontSize = style.getPropertyValue('font-size');
		input.style.margin = style.getPropertyValue('padding');
		input.style.padding = '0 1px';
		var marginRight = parseInt(input.style.marginRight);
		input.style.marginRight = '-'+(button.offsetWidth-marginRight)+'px';
		input.style.width = style.getPropertyValue('width');
		input.style.border = 0;
		input.addEventListener('keypress', updateButton);
		input.addEventListener('keyup', updateButton);
		input.addEventListener('blur', function() {
			if(profiles[id].profile !== 0) {
				if(typeof xhrRename[id] !== 'undefined')
					xhrRename[id].abort();

				tabBar.contentNode.removeChild(input);
				var data = new FormData();
				data.append('profile', profiles[id].profile);
				data.append('name', profiles[id].name);

				xhrRename[id] = new AjaxRequest
				(	SERVER+'profiler/rename.php'
				,	{	callback:
						function() {
							// Success renaming profile
							delete xhrRename[id];
						}
					,	error:
						function() {
							// Error renaming profile
							delete xhrRename[id];
							console.log('Error renaming profile');
							console.log(this);
						}
					}
					,	data
				);
			}
		});
		input.select();
		
		function updateButton(e) {
			switch(e.keyCode) {
				case 13: // Enter
				case 27: // Esc
					input.blur();
			}
			profiles[id].name = input.value;
			button.firstChild.nodeValue = input.value;
			if(e.type === 'keypress')
				button.firstChild.nodeValue += String.fromCharCode(e.keyCode);
			input.style.marginRight = '-'+(button.offsetWidth-marginRight)+'px';
			input.style.width = parseInt(style.getPropertyValue('width'))+'px';
		}
	}
	
	function deleteProfile() {
		var id = active;
		if(profiles[id].profile !== 0) {
			tabBar.removeTab(id);
			profiles[id].deleted = true;
			for(var i = parseInt(id)+1; i < profiles.length; ++i)
				if(!profiles[i].deleted)
					break;
			if(i === profiles.length)
				for(i = parseInt(id)-1; i >= 0; --i)
					if(!profiles[i].deleted)
						break;
			if(i !== -1)
				tabBar.setActiveTab(''+i);
			else
				newProfile();
			
			var data = new FormData();
			data.append('profile', profiles[id].profile);

			new AjaxRequest
			(	SERVER+'profiler/delete.php'
			,	{	error:
					function() {
						// Error deleting profile
						console.log('Error deleting profile');
						console.log(this);
					}
				}
				,	data
			);
		}
	}
	
	this.changeTab = function(tab) {
		if(tab === 'tab-profiler')
			css.addClass(tabBar.contentNode, 'tabbar-profiler');
		else {
			css.removeClass(tabBar.contentNode, 'tabbar-profiler');
			if(typeof input !== 'undefined')
				input.blur();
		}
	};
}