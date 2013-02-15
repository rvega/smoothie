(function() {
// NOTE If we would use strict mode for this closure we won't allow the paths
//      to be executed in normal mode.

var urlCleaner = document.createElement('A');

function load(source, exports, module) {
	require.pwd.unshift(module.id.match(/^.*\//)[0]);
	eval('('+source+')();\n//@ sourceURL='+module.uri+'\n');
	require.pwd.shift();
}

function require(path, callback) {
	var bInfo = require.resolve(path);
	var mInfo = bInfo.sub?{'id':bInfo.id+'/'+bInfo.sub,'uri': bInfo.uri+'#'+bInfo.sub}:bInfo;

	if (require.cache[bInfo.id]) {
		if (!require.cache[mInfo.id]) {
			require.cache[mInfo.id] = new Object();
			load(require.cache[bInfo.id][bInfo.sub], require.cache[mInfo.id], mInfo);
		}
		// NOTE The callback should always be called asynchronously to ensure
		//      that a cached call won't differ from an uncached one.
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

		if (!require.cache[bInfo.id]) {
			require.cache[bInfo.id] = new Object();
			load('function(){\n'+this.responseText+'\n}', require.cache[bInfo.id], bInfo);
		}
		if (!require.cache[mInfo.id]) {
			require.cache[mInfo.id] = new Object();
			load(require.cache[bInfo.id][bInfo.sub], require.cache[mInfo.id], mInfo);
		}
		hook = require.cache[mInfo.id];

		callback && callback(hook);
	};

	request.open('GET', bInfo.uri, !!callback);
	request.send();
	return hook;
}

require.resolve = function(path) {
	var m = path.match(/^(?:(\.{0,2})\/)?((?:[^\/]+\/+)*?)([^\/\.]+)?(\.[^\/]*)?(?:\/\/([^\/]+))?$/);
	urlCleaner.href = (m[1]?require.pwd[0]+m[1]:'')+'/'+m[2];
	
	return {
		'id': urlCleaner.pathname.replace(/\/\/+/g, '/')+(m[3]?m[3]:'index'),
	 	'uri': urlCleaner.href+(m[3]?m[3]+(m[4]?m[4]:'.js'):'index.js'),
		'sub': m[5]
	};
}

// INFO Module cache
require.cache = new Object();
// INFO Relative module paths (0 = current)
require.pwd = Array(location.pathname.replace(/\/\/+/g, '/'));

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';
window.require = require;

})();
