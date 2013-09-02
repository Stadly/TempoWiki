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
					var info = eval('('+this.responseText+');');
					new AjaxRequest
					(	SERVER+'auth.php?password='+getPassword(info.key)
					,	{	callback:
							function() {
								var info = eval('('+this.responseText+');');
								if(info.authenticated === true) {
									authenticated = true;
									success(info.config, info.profiles);
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