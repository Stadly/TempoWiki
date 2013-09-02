function AjaxRequest(uri, callback, post) {
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

	if(typeof post !== 'undefined' && post !== null) {
		xhr.open('POST', uri, true);
		xhr.send(post);
	} else {
		xhr.open('GET', uri, true);
		xhr.send();
	}
	
	this.abort = function() {
		if(xhr.readyState !== 4)
			xhr.abort();
	};
}
