(function() {
	var Auth = {};
	var currentUser = null;
	var accessToken = null;
	
	Auth.authenticate = function(user, success, failure) {
		var data = new FormData();
		data.append('user-identifier', user.identifier);
		data.append('user-username', user.username);
		data.append('user-name', user.name);
		
		new AjaxRequest
		(	SERVER+'auth.php'
		,	{	callback:
				function() {
					var data = eval('('+this.responseText+');');
					if(data.authenticated === true) {
						currentUser = user;
						accessToken = data.token;
						success(data.config, data.profiles);
					} else
						failure.call(this);
				}
			,	error: failure
			}
		,	data
		);
	};
	
	Auth.authenticated = function() {
		return currentUser !== null;
	};
	
	Auth.getUser = function() {
		return currentUser;
	};
	
	Auth.getToken = function() {
		return accessToken;
	};
	
	window.Auth = Auth;
})();