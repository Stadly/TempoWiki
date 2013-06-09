function TW(application) {
	this.changeTab = function(tab) {
		application.arguments[0] = 'tab-'+tab;
		application.dispatchEvent('arguments');
	};
}

TW.prototype.createTab = function(name) {
	return document.getElementById('wrapper').appendChild(TW.createElement('div', {id: 'tab-'+name, className: 'tab'}));
};

TW.prototype.createElement = function(type, attrs) {
	var elm = document.createElement(type);
	for(var attr in attrs) {
		switch(attr) {
			case 'id':
			case 'className':
			case 'name':
			case 'type':
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
	return '<span class="artist">'+TW.getArtist(track)+'</span> - <span class="title">'+track.name.decodeForText()+'</span>';
};

TW.prototype.getArtist = function(track) {
	var artists = [];
	for(var i = 0; i < track.artists.length; ++i)
		artists.push(track.artists[i].name.decodeForText());
	return artists.join(', ');
};

TW.prototype.sortAlpha = function(a, b, removeThe) {
	var textA = a.toLowerCase();
	var textB = b.toLowerCase();
	if(removeThe) {
		textA = textA.replace(/^the\s+/, '');
		textB = textB.replace(/^the\s+/, '');
	}
	return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
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

(function() {
	var translation = null;
	
	function gettext(text) {
		var translated = text;
		if(translation !== null && text !== null && text in translation && translation[text] !== null)
			translated = translation[text];
		
		if(arguments.length > 1) {
			var aps = Array.prototype.slice;
			var args = aps.call(arguments, 1);
			a = arguments;
			translated = translated.replace(/\{([^}]+)\}/g, function(_,match){return args[match];});
		}
		
		return translated;
	}

	gettext.setTranslation = function(newTranslation) {
		if(typeof newTranslation !== 'undefined')
			translation = newTranslation;
	};
	
	window._ = gettext;
})();