function AjaxRequest(uri, callback, post, authType) {
	var xhr = new XMLHttpRequest();

	if(typeof(callback) === 'function')
		xhr.callback = callback;
	else if(typeof(callback) === 'object') {
		if(callback.hasOwnProperty('callback'))
			xhr.callback = callback.callback;
		if(callback.hasOwnProperty('loadstart'))
			xhr.upload.addEventListener('loadstart', callback.loadstart);
		if(callback.hasOwnProperty('progress'))
			xhr.upload.addEventListener('progress', callback.progress);
		if(callback.hasOwnProperty('load'))
			xhr.upload.addEventListener('load', callback.load);
		if(callback.hasOwnProperty('error')) {
			xhr.error = callback.error;
			xhr.upload.addEventListener('error', callback.error);
		}
		if(callback.hasOwnProperty('abort'))
			xhr.upload.addEventListener('abort', callback.abort);
	}

	xhr.onreadystatechange = function() {
		if(this.readyState === 4)
			switch(this.status) {
				case 200:
					if(typeof this.callback === 'function')
						this.callback.call(this);
					break;
				case 404:
					if(typeof this.error === 'function')
						this.error.call(this);
			}
	};
	
	if(typeof authType !== 'undefined' && authType === 'User' && Auth.authenticated()) {
		if(typeof post === 'undefined' || post === null)
			post = new FormData();
		post.append('user-identifier', Auth.getUser().identifier);
		post.append('user-username', Auth.getUser().username);
		post.append('user-name', Auth.getUser().name);
	}

	if(typeof post !== 'undefined' && post !== null)
		xhr.open('POST', uri, true);
	else
		xhr.open('GET', uri, true);
	
	if(typeof authType !== 'undefined' && authType === 'Token' && null !== Auth.getToken())
		xhr.setRequestHeader('Authorization', 'Bearer '+Auth.getToken());

	if(typeof post !== 'undefined' && post !== null)
		xhr.send(post);
	else
		xhr.send();
	
	this.abort = function() {
		if(xhr.readyState !== 4)
			xhr.abort();
	};
}
