function Genres(config, css, Button) {
	var accentuation = ['negative', '', 'positive'];
	var children = getGenres(config, null);
	var genres = new Genre(null, null, null, null, children);

	genres.display = function(container, states, markHierarchy, callback) {
		var self = this;
		var genres = {};

		this.addGenre = function(id, genre, button) {
			genres[id] = {genre: genre, state: 0, clicked: 0, positiveChildren: 0, active: true, button: button};
			button.node.addEventListener('click', function(){self.mark(id, ((genres[id].state+states-1) % states)-states+2, 'click');});
			button.node.addEventListener('mouseover', function(){button.setAccentuated(genres[id].state !== -1, accentuation[(genres[id].state+2) % 3]);});
			button.node.addEventListener('mouseout', function(){button.setAccentuated(genres[id].state !== 0, accentuation[genres[id].state+1]);});
		};

		for(var i = 0; i < children.length; ++i)
			children[i].display(container, this);

		this.getSelection = function() {
			var selection = {};
			for(var id in genres)
				if(markHierarchy) {
					if(genres[id].active || ((genres[id].state === 1 && positiveChildren(id)) || (genres[id].state === -1 && negativeParent(id))))
						selection[id] = genres[id].state;
				} else {
					if(genres[id].active && genres[id].state !== 0)
						selection[id] = genres[id].state;
				}
			return selection;
		};

		function positiveChildren(id) {
			var children = genres[id].genre.getChildren();
			for(var i = 0; i < children.length; ++i)
				if(genres[children[i]].state === 1 && (genres[children[i]].active || positiveChildren(children[i])))
					return true;
			return false;
		}

		function negativeParent(id) {
			var parent = genres[id].genre.getParent();
			if(parent !== null && genres[parent].state === -1 && (genres[parent].active || negativeParent(parent)))
				return true;
			return false;
		}

		this.enable = function() {
			for(var id in genres)
				genres[id].button.setDisabled(false);
		};

		this.disable = function() {
			for(var id in genres)
				genres[id].button.setDisabled(true);
		};

		this.load = function(config) {
			config = config || {};
			for(var id in genres)
				self.mark(id, Math.round(config[id] || 0), 'load');
		};

		this.mark = function(id, state, context) {
			var parent = genres[id].genre.getParent();
			var children = genres[id].genre.getChildren();
			var oldState = genres[id].state;
			if((context === 'child' && state !== -1) || (context === 'parent' && state === 0 && oldState === 1))
				state = genres[id].clicked;
			genres[id].state = state;
			if(context === 'load' || context === 'click')
				genres[id].clicked = state;
			if(context === 'click')
				genres[id].button.setAccentuated(genres[id].state !== -1, accentuation[(genres[id].state+2) % 3]);
			else
				genres[id].button.setAccentuated(genres[id].state !== 0, accentuation[genres[id].state+1]);
			if(parent !== null && state !== oldState)
				genres[parent].positiveChildren += state > 0 ? 1 : (oldState > 0 ? -1 : 0);
			if(context !== 'load' && markHierarchy) {
				if(context !== 'child' && parent !== null && (state === 1 || genres[parent].positiveChildren === 0))
					this.mark(parent, Math.max(state, 0), 'parent');
				if(context !== 'parent')
					for(var i = 0; i < children.length; ++i)
						this.mark(children[i], state, 'child');
				if(state !== 1 && genres[id].positiveChildren > 0)
					this.mark(id, 1);
			}
			if(context === 'click' && typeof callback === 'function')
				callback();
		};

		this.getNames = function(config) {
			var exclude = [];
			var include = [];
			for(var id in genres)
				if(genres[id].active && config.indexOf(parseInt(id)) !== -1) {
					include.push(id);
					if(exclude.indexOf(genres[id].genre.getParent()+'') === -1)
						exclude.push(genres[id].genre.getParent()+'');
				}
			var name = [];
			var short = [];
			for(var i = 0; i < include.length; ++i) {
				name.push(genres[include[i]].genre.getName());
				if(exclude.indexOf(include[i]) === -1)
					short.push(genres[include[i]].genre.getShort());
			}
			return {name: name.join(', '), short: short.join(', '), config: config};
		};

		this.changeProfile = function(config) {
			container.style.display = config !== null && config.length > 0 ? '' : 'none';
			var changed = false;
			for(var id in genres) {
				var show = config !== null && config.indexOf(parseInt(id)) !== -1;
				changed |= show !== genres[id].active && genres[id].state !== 0;
				genres[id].button.node.style.display = show ? '' : 'none';
				genres[id].active = show;
			}
			if(changed && typeof callback === 'function')
				callback();
		};
		
		this.compareMetadata = function(metadata1, metadata2) {
			for(var id in genres) {
				if(genres[id].active && metadata1[id] !== metadata2[id])
					return false;
			}
			return true;
		};
		
		this.playlistName = function() {
			var selection = self.getSelection();
			var name = [];
			for(var id in selection) {
				if(selection[id] === 1)
					name.push(genres[id].genre.getShort());
				else if(selection[id] === -1)
					name.push('-'+genres[id].genre.getShort());
			}
			return name.join(',');
		};
	};

	return genres;

	function getGenres(config, parent) {
		var genres = [];
		for(var i = 0; i < config.length; ++i)
			genres.push(new Genre(config[i][0], config[i][1], config[i][2], parent, getGenres(config[i][3], config[i][0])));
		return genres;
	}

	function Genre(id, name, short, parent, children) {
		this.getId = function(){return id;};
		this.getName = function(){return name;};
		this.getShort = function(){return short;};
		this.getParent = function(){return parent;};

		this.getChildren = function() {
			var c = [];
			for(var i = 0; i < children.length; ++i)
				c.push(children[i].getId());
			return c;
		};

		this.display = function(container, instance) {
			if(children.length > 0)
				container = container.appendChild(document.createElement('div'));
			var button = Button.withLabel(name);
			instance.addGenre(id, this, button);
			container.appendChild(button.node);
			if(children.length > 0) {
				css.addClass(button, 'parent');
				for(var i = 0; i < children.length; ++i)
					children[i].display(container, instance);
			}
		};
	}
}