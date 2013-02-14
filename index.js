(function() {
// NOTE If we would use strict mode for this closure we won't allow the paths
//      to be executed in normal mode.

function require(path, callback) {
	var rpath = require.resolve(path);

	function load(source) {
		var exports = new Object();
		eval('('+source+')();\n//@ sourceURL='+rpath.href+'\n');
		return exports;
	}

	if (!require.cache[rpath.href])
		require.cache[rpath.href] = new Object();
	if (require.cache[rpath.href][0]) {
		if (!require.cache[rpath.href][rpath.module])
			require.cache[rpath.href][rpath.module] = load(require.cache[rpath.href][0][rpath.module]);
		// NOTE The callback should always be called asynchronously
		callback && setTimeout(function(){callback(require.cache[rpath.href][rpath.module])}, 0);
		return require.cache[rpath.href][rpath.module];
	}
	
	var hook = null;
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (this.readyState != 4)
			return;
		if (this.status != 200)
			throw 'Require() exception: GET '+rpath.href+' '+this.status+' ('+this.statusText+')';

		if (this.getResponseHeader('content-type').indexOf('application/json') != -1) {
			require.cache[rpath.href][0] = JSON.parse(this.responseText);
			hook = require.cache[rpath.href][0];
		}
		else {
			if (!require.cache[rpath.href][0])
				require.cache[rpath.href][0] = load('function(){\n'+this.responseText+'\n}');
			if (!require.cache[rpath.href][rpath.module])
				require.cache[rpath.href][rpath.module] = load(require.cache[rpath.href][0][rpath.module]);
			hook = require.cache[rpath.href][rpath.module];
		}

		callback && callback(hook);
	};

	request.open('GET', rpath.href, !!callback);
	request.send();
	return hook;
}

require.resolve = function(path) {
	// TODO handle relative paths
	var m = path.match(/^((?:\.{0,2}\/)?)((?:.+?\/)*?)(?:([^\/]+?)(\.[^\/]+)?)?(?:\/\.\/([^\/]+))?$/);
	return {
	 	'href': (m[1]?m[1]:'/jsModules/')+m[2]+(m[3]?m[3]+(m[4]?m[4]:'.js'):'index.js'),
	 	'module': m[5]?m[5]:0,
	};
}

// INFO initializing cache
require.cache = new Object();

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';
window.require = require;

})();
