(function() {
	var Auth = {};
	var authenticated = false;
	
	Auth.authenticate = function(user, success, failure) {
		authenticated = false;
		
		var data = new FormData();
		data.append('user-identifier', user.identifier);
		data.append('user-username', user.username);
		data.append('user-name', user.name);
		
		new AjaxRequest
		(	SERVER+'auth.php'
		,	{	callback:
				function() {
					var data = eval('('+this.responseText+');');
					new AjaxRequest
					(	SERVER+'auth.php?password='+getPassword(data.key)
					,	{	callback:
							function() {
								var data = eval('('+this.responseText+');');
								if(data.authenticated === true) {
									authenticated = true;
									success(data.config, data.profiles);
								} else
									failure.call(this);
							}
						,	error: failure
						}
					);
				}
			,	error: failure
			}
		,	data
		);
	};
	
	Auth.authenticated = function() {
		return authenticated;
	};
	
	function getPassword(key) {
		// Perform some secret algorithm on the key
		return key;
	}
	
	window.Auth = Auth;
})();