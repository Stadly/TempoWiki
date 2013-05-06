function TW(application) {
	this.changeTab = function(tab) {
		application.arguments[0] = 'tab-'+tab;
		application.dispatchEvent('arguments');
	};
}

TW.prototype.createElement = function(type, id, className, content) {
	var elm = document.createElement(type);
	if(typeof id !== 'undefined' && id !== null)
		elm.id = id;
	if(typeof className !== 'undefined' && className !== null)
		elm.className = className;
	if(typeof content !== 'undefined' && content !== null)
		elm.innerHTML = content;
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
{	OK: 0
,	NOT_EDITING: 1
,	NOT_PLAYING: 2
,	DIFFERENT: 3
};

Function.prototype.inheritsFrom = function(parentClassOrObject) {
	if(parentClassOrObject.constructor === Function) {
		//Normal Inheritance
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} else { 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	}
	return this;
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
			translated = translated.replace(/\{([^}]+)\}/g, function(_, match){return args[match];});
		}
		
		return translated;
	}

	gettext.setTranslation = function(newTranslation) {
		if(typeof newTranslation !== 'undefined')
			translation = newTranslation;
	};
	
	window._ = gettext;
})();