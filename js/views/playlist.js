function Playlist(models, css, Button, Throbber, List) {
	var container = TW.createTab('playlist');
	var form = container.appendChild(document.createElement('form'));
	var playlist, list, xhr;
	var sorting =
	{	func:
		{	order:		[true,	function(a,b){return TW.sortNum(a.order, b.order);}]
		,	time:			[true,	function(a,b){return TW.sortNum(a.duration, b.duration);}]
		,	popularity:	[false,	function(a,b){return TW.sortNum(a.popularity, b.popularity);}]
		,	track:		[true,	function(a,b){return TW.sortAlpha(a.name.decodeForText(), b.name.decodeForText());}]
		,	artist:		[true,	function(a,b){return TW.sortAlpha(TW.getArtist(a), TW.getArtist(b), true);}]
		// The album is not always loaded, for some reason
		,	album:		[true,	function(a,b){return TW.sortAlpha((a.album.name || '').decodeForText(), (b.album.name || '').decodeForText(), true);}]
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
					if(this.current[i][0] === arg || this.current[i][0] === 'order')
						this.current.splice(i--, 1);
			}
			
			tracks.sort(function(a, b) {
				for(var i = 0; i < sorting.current.length; ++i) {
					var res = sorting.func[sorting.current[i][0]][1](a, b, sorting.current[i][1]);
					if(res !== 0)
						return sorting.current[i][1] ? res : -res;
				}
				return 0;
			});
			
			showPlaylist(tracks);

			// Code to test if the bug below has been fixed. Comment out the above code, and uncomment the below code
//			if(list.model.items.length === 0)
//				playlist.tracks.add(tracks);
//			playlist.tracks.snapshot().done(function(snapshot) {
//				console.log(snapshot.find(models.player.track));
//				playlist.tracks.insert(snapshot.find(models.player.track), tracks[0]);
//			});
			
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
		}
	};
	
	var addPlaylistBtn = Button.withLabel('');
	addPlaylistBtn.setIconClass('sp-icon-add');
	css.addClass(addPlaylistBtn.node, 'add-playlist');
	addPlaylistBtn.node.addEventListener('click', function() {
		addPlaylistBtn.setLabel(_('Playlist added'));
		addPlaylistBtn.setDisabled(true);
		models.Playlist.create('TempoWiki ' + properties.playlistName()).done(function(playlist) {
			playlist.load('tracks').done(function(){playlist.tracks.add(list.model.items);});
		});
	});

	var properties = Properties.forPlaylist(sorting.func, form, update);
	form.appendChild(addPlaylistBtn.node);
	
	models.Playlist.createTemporary('tempowiki-playlist').done(function(list) {
		playlist = list;
		showPlaylist();
	});
	
	function updateAddPlaylistBtn(playlistLength) {
		if(playlistLength === 0)
			addPlaylistBtn.node.style.display = 'none';
		else {
			addPlaylistBtn.setLabel(_('Add as Playlist'));
			addPlaylistBtn.node.style.display = '';
			addPlaylistBtn.setDisabled(false);
		}
	}
	
	function showPlaylist(tracks) {
		if(typeof list !== 'undefined')
			container.removeChild(list.node);
		
		playlist.load('tracks').done(function(){
			playlist.tracks.clear();
			playlist.tracks.add(tracks || []).done(function(){
				// BUG: Hiding unplayable does not seem to be working
				list = List.forCollection(playlist.tracks, {fields: ['ordinal', 'star', 'track', 'artist', 'time', 'album', 'popularity', 'dancegenre', 'musicgenre', 'tempo'], unplayable: 'hidden'});
				
				// Go through list.model.items and tracks and compare uris.
				// Create database over tracks that should be combined
				// Copy over data from track in tracks to track in playlist
				properties.setPlaylist(list);
				
				for(var i = 0; i < list.model.fields.length; ++i)
					if(sorting.func.hasOwnProperty(list.model.fields[i].id)) {
						css.addClass(list.view.nodes.headerRow.children[i], 'sp-list-heading-sortable');
						list.view.nodes.headerRow.children[i].addEventListener('click', (function(field){return function(){sorting.sort(field);};})(list.model.fields[i].id));
					}
		
				updateAddPlaylistBtn(typeof tracks === 'undefined' ? 0 : tracks.length);
				container.appendChild(list.node);
				list.init();
				
				// Creating custom throbber, since the built-in one is reset during loading, and therefore changes appearance
				list.throbber = Throbber.forElement(list.node);
				list.throbber.hide();
				
				if(typeof list !== 'undefined')
					for(var i = 0; i < list.model.fields.length; ++i) {
						var cell = list.view.nodes.headerRow.children[i];
						css.removeClass(cell, 'sp-list-heading-sorted');
						css.removeClass(cell, 'sp-list-heading-sorted-asc');
						css.removeClass(cell, 'sp-list-heading-sorted-desc');
						if(sorting.current.length > 0 && list.model.fields[i].id === sorting.current[0][0]) {
							css.addClass(cell, 'sp-list-heading-sorted');
							css.addClass(cell, sorting.current[0][1] ? 'sp-list-heading-sorted-asc' : 'sp-list-heading-sorted-desc');
						}
					}
			});
		});
	}

	function update() {
		if(typeof xhr !== 'undefined')
			xhr.abort();
		
		var update = false;
		var data = new FormData();
		update |= properties.submit(data);

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
						var metadata = eval('('+this.responseText+');');

						// BUG: If hiding unplayable, sorting unplayable and keep current sorting when changing playlist had worked
//						var tracks = [];
//						for(var i = 0; i < metadata.length; ++i) {
//							var track = models.Track.fromURI(metadata[i].track);
//							track.order = i;
//							properties.updateTrack(track, metadata[i]);
//							tracks.push(track);
//						}
//						list.throbber.hide();
//						sorting.sort(null, tracks);

						// Solution to make hiding unplayable, sorting unplayable and keep current sorting when changing playlist work
						var promises = [];
						for(var i = 0; i < metadata.length; ++i) {
							var track = models.Track.fromURI(metadata[i].track);
							track.order = i;
							properties.updateTrack(track, metadata[i].properties);
							promises.push(track.load('playable', 'name', 'artists', 'duration', 'album', 'popularity'));
						}
						var tracks = [];
						models.Promise.join(promises).each(function(track) {
							if(track.playable)
								tracks[track.order] = track;
						}).done(function() {
							for(var i = 0; i < tracks.length; ++i) 
								if(!(i in tracks))
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