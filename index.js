(function() {
// NOTE If we would use strict mode for this closure we won't allow the paths
//      to be executed in normal mode.

var urlCleaner = document.createElement('A');

function require(path, callback) {
	var bInfo = require.resolve(path);
	var mInfo = bInfo.sub?{'id':bInfo.id+'/'+bInfo.sub,'uri': bInfo.uri+'#'+bInfo.sub}:bInfo;

	// TODO set relative paths

	function load(source, module) {
		var exports = new Object();
		eval('('+source+')();\n//@ sourceURL='+module.uri+'\n');
		return exports;
	}

	if (require.cache[bInfo.id]) {
		if (!require.cache[mInfo.id])
			require.cache[mInfo.id] = load(require.cache[bInfo.id][bInfo.sub], mInfo);
		// NOTE The callback should always be called asynchronously to ensure
		//      that a cached call won't be different from an uncached one.
		callback && setTimeout(function(){callback(require.cache[mInfo.id])}, 0);
		return require.cache[mInfo.id];
	}
	
	var hook = null;
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (this.readyState != 4)
			return;
		if (this.status != 200)
			throw 'Require() exception: GET '+bInfo.uri+' '+this.status+' ('+this.statusText+')';

		if (!require.cache[bInfo.id])
			require.cache[bInfo.id] = load('function(){\n'+this.responseText+'\n}', bInfo);
		if (!require.cache[mInfo.id])
			require.cache[mInfo.id] = load(require.cache[bInfo.id][bInfo.sub], mInfo);
		hook = require.cache[mInfo.id];

		callback && callback(hook);
	};

	request.open('GET', bInfo.uri, !!callback);
	request.send();
	return hook;
}

require.resolve = function(path) {
	var m = path.match(/^(\.{0,2}\/)?((?:[^\/]+\/+)*?)([^\/\.]+)?(\.[^\/]*)?(?:\/\/([^\/]+))?$/);
	urlCleaner.href = (m[1]?(m[1]!='/'?require.pwd[0]:'')+m[1]:'/jsModules/')+m[2];
	
	return {
		'id': urlCleaner.pathname.replace(/\/\/+/g, '/')+(m[3]?m[3]:'index'),
	 	'uri': urlCleaner.href+(m[3]?m[3]+(m[4]?m[4]:'.js'):'index.js'),
		'sub': m[5]
	};
}

// INFO initializing cache
require.cache = new Object();
// INFO Relative module path (0 = current)
require.pwd = Array(location.pathname);

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';
window.require = require;

})();
