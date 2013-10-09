function TW(application) {
	this.changeTab = function(tab) {
		application.arguments[0] = 'tab-'+tab;
		application.dispatchEvent('arguments');
	};
}

TW.prototype.createTab = function(name) {
	var tab = document.getElementById('wrapper').appendChild(TW.createElement('div', {id: 'tab-'+name, className: 'tab'}));
	tab.style.display = 'none';
	return tab;
};

TW.prototype.createElement = function(type, attrs) {
	var elm = document.createElement(type);
	for(var attr in attrs) {
		switch(attr) {
			case 'id':
			case 'className':
			case 'name':
			case 'type':
			case 'src':
			case 'value':
				elm[attr] = attrs[attr];
				break;
			case 'for':
				elm.setAttribute(attr, attrs[attr]);
				break;
			case 'content':
				elm.innerHTML = attrs[attr];
				break;
		}
	}
	return elm;
};

TW.prototype.trackToString = function(track) {
	return '<span class="artist">'+TW.getArtist(track, true)+'</span> - <span class="title">'+track.name.decodeForHtml()+'</span>';
};

TW.prototype.getArtist = function(track, asLink) {
	var artists = [];
	for(var i = 0; i < track.artists.length; ++i) {
		var artist = track.artists[i].name.decodeForHtml();
		if(asLink)
			artist = '<a href="'+track.artists[i].uri+'">'+artist+'</a>';
		artists.push(artist);
	}
	return artists.join(', ');
};

TW.prototype.sortAlpha = function(a, b, removeThe) {
	a = a.toLowerCase();
	b = b.toLowerCase();
	if(removeThe) {
		a = a.replace(/^the\s+/, '');
		b = b.replace(/^the\s+/, '');
	}
	return (a < b) ? -1 : (a > b) ? 1 : 0;
};

TW.prototype.sortNum = function(a, b) {
	return a-b;
};

TW.prototype.editStatus =
{	OK:				0
,	NOT_EDITING:	1
,	NOT_PLAYING:	2
,	DIFFERENT:		3
};