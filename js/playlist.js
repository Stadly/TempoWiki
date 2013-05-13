function Playlist(models, css, Throbber, List) {
	var container = document.getElementById('wrapper').appendChild(TW.createElement('div', 'tab-playlist', 'tab'));
	var form = container.appendChild(document.createElement('form'));
	var list;
	var xhr;
	var danceGenres;
	var bpm;
	var sorting =
	{	func:
		{	order:		[true,	function(a,b) {return TW.sortNum(a.order, b.order);}]
		,	time:			[true,	function(a,b) {return TW.sortNum(a.duration, b.duration);}]
		,	popularity:	[false,	function(a,b) {return TW.sortNum(a.popularity, b.popularity);}]
		,	track:		[true,	function(a,b) {return TW.sortAlpha(a.name.decodeForText(), b.name.decodeForText());}]
		,	artist:		[true,	function(a,b) {return TW.sortAlpha(TW.getArtist(a), TW.getArtist(b), true);}]
		,	album:		[true,	function(a,b) {return TW.sortAlpha(a.album.name.decodeForText(), b.album.name.decodeForText(), true);}]
		}
	,	current: []
	,	sort: function(arg, tracks) {
			tracks = tracks || list.model.items.splice(0);
			if(arg !== null) {
				if(this.current.length > 0 && this.current[0][0] === arg) {
					if(this.current[0][1] === !this.func[arg][0]) {
						this.current[0][0] = 'order';
						this.current[0][1] = false;
					}
					this.current[0][1] = !this.current[0][1];
				} else
					this.current.unshift([arg, this.func[arg][0]]);
				for(var i = 1; i < this.current.length; ++i)
					if(this.current[i][0] in [arg, 'order'])
						this.current = this.current.splice(i--, 1);
			}
			
			tracks.sort(function(a, b) {
				for(var i = 0; i < sorting.current.length; ++i) {
					var res = sorting.func[sorting.current[i][0]][1](a, b, sorting.current[i][1]);
					if(res !== 0)
						return sorting.current[i][1] ? res : -res;
				}
				return 0;
			});
			
			for(var i = 0; i < list.model.fields.length; ++i) {
				css.removeClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sorted');
				css.removeClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sorted-asc');
				css.removeClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sorted-desc');
				if(this.current.length > 0 && list.model.fields[i].id === this.current[0][0]) {
					css.addClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sorted');
					css.addClass(list.view.nodes.headerRow.children[i], this.current[0][1] ? 'sp-list-heading-sorted-asc' : 'sp-list-heading-sorted-desc');
				}
			}
			
			// Error when list contains unplayable tracks
			// Context is changed, so playing stops when track is finished
			// Might be possible to sort playlist using list.item.tracks.sort(), but currently this is not working at all
			list.item.tracks.clear();
			list.item.tracks.add(tracks);

			// Attempt to fix so that context is not changed, but does not work
//			list.item.tracks.snapshot().done(function(snapshot) {
//				for(var i = 0; i < tracks; ++i)
//					if(tracks[i] !== models.player.track)
//						list.item.tracks.remove(snapshot.find(tracks[i]));
//				list.item.tracks.insert(snapshot.ref(0), tracks);
//			});
		}
	};

	models.Playlist.createTemporary('playlist').done(function(playlist) {
		// Hiding the unplayable tracks does not seem to be working
		list = List.forPlaylist(playlist, {fields: ['ordinal', 'star', 'track', 'artist', 'time', 'album', 'popularity', 'dancegenre', 'bpm'], unplayable: 'hidden'});
		window.list = list;
		
		danceGenres = new DanceGenres.forPlaylist(list, form, update, css);
		bpm = new BPM.forPlaylist(list, sorting.func, form, update, css);
		
		for(var i = 0; i < list.model.fields.length; ++i)
			if(typeof sorting.func[list.model.fields[i].id] !== 'undefined') {
				css.addClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sortable');
				list.view.nodes.headerRow.children[i].addEventListener('click', (function(field){return function(){sorting.sort(field);};})(list.model.fields[i].id));
			}

		playlist.tracks.clear();
		container.appendChild(list.node);
		list.init();
		// Creating custom throbber, since the built-in one is reset during loading, and therefore changes appearance
		list.throbber = Throbber.forElement(list.node);
		list.throbber.hide();
	});

	function update() {
		if(typeof xhr !== 'undefined')
			xhr.abort();
		
		var update = false;
		var data = new FormData();
		update |= danceGenres.submit(data);
		update |= bpm.submit(data);

		if(update) {
			list.throbber.show();
			list.throbber.showContent();
			if(list.length > 3) {
				list.throbber.setSize('normal');
				list.throbber.setPosition('center', 24);
			} else
				list.throbber.setPosition('center', 'center');
			xhr = new AjaxRequest
			(	SERVER+'playlist.php'
			,	function() {
					// Success fetching playlist
					var info = eval('('+this.responseText+');');
					
					// If hiding unplayable, sorting unplayable and keep current sorting when changing playlist had worked
//					var tracks = [];
//					for(var i = 0; i < info.length; ++i) {
//						var track = models.Track.fromURI(info[i].track);
//						track.order = i;
//						bpm.updateTrack(track, info[i].bpm);
//						tracks.push(track);
//					}
//					list.throbber.hide();
//					list.item.tracks.clear();
//					list.item.tracks.add(tracks);
					
					// Solution to make hiding unplayable, sorting unplayable and keep current sorting when changing playlist work
					var promises = [];
					for(var i = 0; i < info.length; ++i) {
						var track = models.Track.fromURI(info[i].track);
						track.order = i;
						bpm.updateTrack(track, info[i].bpm);
						danceGenres.updateTrack(track, info[i].dancegenres);
						promises.push(track.load('name'));
					}
					var tracks = [];
					models.Promise.join(promises).each(function(track) {
						if(track.playable)
							tracks[track.order] = track;
					}).done(function() {
						for(var i = 0; i < tracks.length; ++i)
							if(typeof tracks[i] === 'undefined')
								tracks.splice(i--, 1);
						list.throbber.hide();
						sorting.sort(null, tracks);
					});
				}
			,	function() {
					// Error fetching playlist
					console.log('Error fetching playlist');
					console.log(this);
				}
			,	data
			);
		} else
			list.item.tracks.clear();
	}
};