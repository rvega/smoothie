// NOTE The load parameter points to the function, which prepares the
//      environment for each module and runs its code. Scroll down to the end of
//      the file to see the function definition.
(function(load) { 'use strict';

// INFO Used to parse and cleanup module paths
var anchor = document.createElement('A');
// INFO Module cache
var cache = new Object();
// INFO Paths for relative modules (0 = current)
var pwd = Array(location.pathname.replace(/\/\/+/g, '/'));

function resolve(path) {
	var m = path.match(/^(?:(\.{0,2})\/)?((?:[^\/]+\/+)*?)([^\/\.]+)?(\.[^\/]*)?(?:\/\/([^\/]+))?$/);
	anchor.href = (m[1]?pwd[0]+m[1]:'')+'/'+m[2];
	
	return {
		'id': anchor.pathname.replace(/\/\/+/g, '/')+(m[3]?m[3]:'index'),
	 	'uri': anchor.href+(m[3]?m[3]+(m[4]?m[4]:'.js'):'index.js'),
		'sub': m[5]
	};
}

function require(path, callback) {
	var bInfo = resolve(path);
	var mInfo = bInfo.sub?{'id':bInfo.id+'/'+bInfo.sub,'uri': bInfo.uri+'#'+bInfo.sub}:bInfo;

	if (cache[bInfo.id]) {
		if (!cache[mInfo.id]) 
			load(mInfo, cache, pwd, cache[bInfo.id][bInfo.sub]);
		// NOTE The callback should always be called asynchronously to ensure
		//      that a cached call won't differ from an uncached one.
		callback && setTimeout(function(){callback(cache[mInfo.id])}, 0);
		return cache[mInfo.id];
	}
	
	var hook = null;
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (request.readyState != 4)
			return;
		if (request.status != 200)
			throw 'Require() exception: GET '+bInfo.uri+' '+request.status+' ('+request.statusText+')';

		if (!cache[bInfo.id]) 
			load(bInfo, cache, pwd, 'function(){\n'+request.responseText+'\n}');
		if (!cache[mInfo.id]) 
			load(mInfo, cache, pwd, cache[bInfo.id][bInfo.sub]);
		hook = cache[mInfo.id];

		callback && callback(hook);
	};

	request.open('GET', bInfo.uri, !!callback);
	request.send();
	return hook;
}

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';

if (Object.defineProperty) {
	Object.defineProperty(require, 'resolve', {'value':resolve,'writable':false,'configurable':false});
	Object.defineProperty(window, 'require', {'value':require,'writable':false,'configurable':false});
}
else {
	require.resolve = resolve;
	window.require = require;
}

})(function(module/*, cache, pwd, source*/) {
	var exports = arguments[1][module.id] = new Object();
	arguments[2].unshift(module.id.match(/^.*\//)[0]);
	eval('('+arguments[3]+')();\n//@ sourceURL='+module.uri+'\n');
	arguments[2].shift();
});
