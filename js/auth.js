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
		,	function() {
				var info = eval('('+this.responseText+');');
				new AjaxRequest
				(	SERVER+'auth.php?key='+getKey(info.keyhole)
				,	function() {
						var info = eval('('+this.responseText+');');
						if(info.authenticated === true) {
							authenticated = true;
							success(info.config);
						} else
							failure.call(this);
					}
				,	failure
				);
			}
		,	failure
		,	data
		);
	};
	
	Auth.authenticated = function() {
		return authenticated;
	};
	
	function getKey(keyhole) {
		var key = 'a'+keyhole+'d';
		return key;
	}
	
	window.Auth = Auth;
})();