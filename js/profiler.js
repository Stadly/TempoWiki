function Profiler(TabBar) {
	var profiles =
	{	'profile-all':
		{	name: 'All options'
		,	active: true
		,	config: null
		}
	,	'profile-swing':
		{	name: 'Swing'
		,	config:
			{	dancegenres: ['1','2','3','4','8','12']
			,	tempo:
				{	units: [2]
				}
			,	musicgenres: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19']
			}
		}
	,	'profile-salsa':
		{	name: 'Salsa'
		,	config:
			{	dancegenres: ['22','23','24','25','26','27']
			,	tempo:
				{	units: [1]
				}
			,	musicgenres: []
			}
		}
	,	'profile-standard':
		{	name: 'Standard'
		,	config:
			{	dancegenres: ['5','6','7','13','14','15']
			,	tempo:
				{	units: [1]
				}
			,	musicgenres: []
			}
		}
	,	'profile-latin':
		{	name: 'Latin'
		,	config:
			{	dancegenres: ['16','17','18','19','20','21']
			,	tempo:
				{	units: [1]
				}
			,	musicgenres: []
			}
		}
	};
	var tabBar = TabBar.withTabs([], {sticky: false});
	tabBar.addToDom(document.getElementById('header'), 'after');
	tabBar.addEventListener('tabchange', function(e) {
		var config = profiles[e.id].config;
		Tempo.changeProfile(config === null ? null : config.tempo || null);
		Dancegenres.changeProfile(config === null ? null : config.dancegenres || null);
		Musicgenres.changeProfile(config === null ? null : config.musicgenres || null);
	});
	
	tabBar.contentNode.insertBefore(TW.createElement('span', {content: 'Profiles: '}), tabBar.contentNode.firstChild);
	
	for(var profile in profiles)
		tabBar.addTab({id: profile, name: profiles[profile].name, active: profiles[profile].active});

	var container = TW.createTab('profiler');
	var form = container.appendChild(document.createElement('form'));
	
	var dancegenres = new Dancegenres.forProfiler(form);
	var musicgenres = new Musicgenres.forProfiler(form);
	var tempo = new Tempo.forProfiler(form);
}