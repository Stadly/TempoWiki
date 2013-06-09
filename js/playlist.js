function Playlist(models, css, Throbber, List) {
	var container = TW.createTab('playlist');
	var form = container.appendChild(document.createElement('form'));
	var current, list, xhr, tempo, dancegenres, musicgenres;
	var playlists = [];
	var sorting =
	{	func:
		{	order:		[true,	function(a,b){return TW.sortNum(a.order, b.order);}]
		,	time:			[true,	function(a,b){return TW.sortNum(a.duration, b.duration);}]
		,	popularity:	[false,	function(a,b){return TW.sortNum(a.popularity, b.popularity);}]
		,	track:		[true,	function(a,b){return TW.sortAlpha(a.name.decodeForText(), b.name.decodeForText());}]
		,	artist:		[true,	function(a,b){return TW.sortAlpha(TW.getArtist(a), TW.getArtist(b), true);}]
		,	album:		[true,	function(a,b){return TW.sortAlpha(a.album.name.decodeForText(), b.album.name.decodeForText(), true);}]
		}
	,	current: []
	,	sort: function(arg, tracks) {
			tracks = tracks || list.model.items.slice(0);
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
			
			var found = false;
			if(typeof models.player.context !== 'undefined' && models.player.context !== null)
				for(var i = 0; i < playlists.length && !found; ++i)
					if(models.player.context.uri !== playlists[i].uri) {
						found = true;
						current = i;
						playlists[current].load('tracks').done(function() {
							playlists[current].tracks.clear();
							playlists[current].tracks.add(tracks);
						});
					}
			if(found)
				createList(playlists[current]);
			else
				createPlaylist(tracks);
			
			// Attempt to order list without creating new to avoid changing context (Call reorderPlaylist(playlist[current], tracks) instead of the code above if arg !== null)
			// BUG: Index of current track is not updated, and current track not selectable
//			function reorderPlaylist(playlist, tracksInOrder) {
//				playlist.tracks.snapshot().done(function(snapshot) {
//					var track = models.player.track;
//					var trackPos = tracksInOrder.indexOf(track);
//					var current = snapshot.find(track);
//					if(trackPos !== -1 && current !== null) {
//						var promises = [];
//						promises.push(playlist.tracks.trim(current));
//						promises.push(playlist.tracks.add(tracksInOrder.slice(trackPos+1)));
//						for(var i = current.index-1; i >= 0; --i)
//							promises.push(playlist.tracks.remove(snapshot.ref(i)));
//						models.Promise.join(promises)
//						.fail(function(){reorderPlaylist(playlist.tracks);})
//						.done(function(){
//							playlist.tracks.snapshot().done(function(snapshot) {
//								playlist.tracks.insert(snapshot.find(track), tracksInOrder.slice(0, trackPos));
//								createList(playlist);
//							});
//						});
//					} else {
//						playlist.tracks.clear();
//						playlist.tracks.add(tracksInOrder);
//						createList(playlist);
//					}
//				});
//			}
			
			for(var i = 0; i < list.model.fields.length; ++i) {
				css.removeClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sorted');
				css.removeClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sorted-asc');
				css.removeClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sorted-desc');
				if(this.current.length > 0 && list.model.fields[i].id === this.current[0][0]) {
					css.addClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sorted');
					css.addClass(list.view.nodes.headerRow.children[i], this.current[0][1] ? 'sp-list-heading-sorted-asc' : 'sp-list-heading-sorted-desc');
				}
			}
		}
	};
	
	createPlaylist();

	function createPlaylist(tracks) {
		models.Playlist.createTemporary('playlist-'+playlists.length).done(function(playlist) {
			playlists.push(playlist);
			if(models.player.context === null || typeof models.player.context === 'undefined' || models.player.context.uri !== playlist.uri) {
				current = playlists.length-1;
				playlist.load('tracks').done(function() {
					playlist.tracks.clear();
					if(typeof tracks !== 'undefined')
						playlist.tracks.add(tracks);
					createList(playlist);
				});
			} else
				createPlaylist(tracks);
		});
	}
	
	function createList(playlist) {
		var init = typeof list === 'undefined';
		if(!init)
			container.removeChild(list.node);
			
		list = List.forPlaylist(playlist, {fields: ['ordinal', 'star', 'track', 'artist', 'time', 'album', 'popularity', 'dancegenre', 'musicgenre', 'tempo'], unplayable: 'hidden'});
		for(var i = 0; i < list.model.fields.length; ++i)
			if(typeof sorting.func[list.model.fields[i].id] !== 'undefined') {
				css.addClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sortable');
				list.view.nodes.headerRow.children[i].addEventListener('click', (function(field){return function(){sorting.sort(field);};})(list.model.fields[i].id));
			}

		if(init) {
			dancegenres = new Dancegenres.forPlaylist(list, form, update, css);
			musicgenres = new Musicgenres.forPlaylist(list, form, update, css);
			tempo = new Tempo.forPlaylist(list, sorting.func, form, update, css);
		} else {
			dancegenres.setPlaylist(list);
			musicgenres.setPlaylist(list);
			tempo.setPlaylist(list);
		}

		container.appendChild(list.node);
		list.init();
		// Creating custom throbber, since the built-in one is reset during loading, and therefore changes appearance
		list.throbber = Throbber.forElement(list.node);
		list.throbber.hide();
	}

	function update() {
		if(typeof xhr !== 'undefined')
			xhr.abort();
		
		var update = false;
		var data = new FormData();
		update |= tempo.submit(data);
		update |= dancegenres.submit(data);
		update |= musicgenres.submit(data);

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
			,	{	callback:
					function() {
						// Success fetching playlist
						var info = eval('('+this.responseText+');');

						// BUG: If hiding unplayable, sorting unplayable and keep current sorting when changing playlist had worked
//						var tracks = [];
//						for(var i = 0; i < info.length; ++i) {
//							var track = models.Track.fromURI(info[i].track);
//							track.order = i;
//							tempo.updateTrack(track, info[i].tempo);
//							dancegenres.updateTrack(track, info[i].dancegenres);
//							musicgenres.updateTrack(track, info[i].musicgenres);
//							tracks.push(track);
//						}
//						lists[listCurrent].throbber.hide();
//						sorting.sort(null, tracks);

						// Solution to make hiding unplayable, sorting unplayable and keep current sorting when changing playlist work
						var promises = [];
						for(var i = 0; i < info.length; ++i) {
							var track = models.Track.fromURI(info[i].track);
							track.order = i;
							tempo.updateTrack(track, info[i].tempo);
							dancegenres.updateTrack(track, info[i].dancegenres);
							musicgenres.updateTrack(track, info[i].musicgenres);
							promises.push(track.load('playable'));
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
				,	error:
					function(e) {
						// Error fetching playlist
						console.log('Error fetching playlist');
						console.log(this);
						list.throbber.hide();
						list.item.tracks.clear();
					}
				}
			,	data
			);
		} else
			sorting.sort(null, []);
	}
};