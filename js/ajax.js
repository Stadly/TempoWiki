function AjaxRequest(uri, callback, error, post) {
	var xhr = new XMLHttpRequest();

	if(typeof(callback) === 'function')
		xhr.callback = callback;
	if(typeof(error) === 'function') {
		xhr.upload.addEventListener('error', error);
		xhr.error = error;
	}

	xhr.onreadystatechange = function() {
		if(this.readyState === 4 && typeof this.callback === 'function') {
			if(this.status === 200)
				this.callback.call(this);
			else if(typeof this.error === 'function')
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
