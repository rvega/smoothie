// NOTE The load parameter points to the function, which prepares the
//      environment for each module and runs its code. Scroll down to the end of
//      the file to see the function definition.
(function(load) { 'use strict';

// INFO Module root
var root = location.pathname.replace(/^(.*)\/$/, '$1');
// INFO Module path (0 = current)
var pwd = Array('/');
// INFO Module cache
var cache = new Object();

function resolve(path) {
	var m = path.match(/^(?:(\.{0,2})\/)?((?:[^\/]+\/+)*?)([^\/\.]+)?(\.[^\/]*)?(?:\/\/([^\/]+))?$/);
	var id = ((m[1]?pwd[0]+m[1]:'')+'/'+m[2]);
	// NOTE Remove // and ./ and resolve ../
	id = id.replace(/(?:\/+(?:\.(?!\.))?)+|([^\.]*)((?:\.\.\/)+)/g, function(m, a, b) {
		var i = a?a.split('/').length-b.split('/').length:0; 
		return i>0?a.match(new RegExp('\/(?:[^\/]*\/){0,'+i+'}'))[0]:'/';
	});
	id += (m[3]?m[3]:'index');	

	return {'id':id, 'uri':root+id+(m[4]?m[4]:'.js'), 'sub':m[5]};
}

function require(path, callback) {
	var bInfo = resolve(path);
	var mInfo = bInfo.sub?{'id':bInfo.id+'/'+bInfo.sub,'uri': bInfo.uri+'#'+bInfo.sub}:bInfo;

	if (cache[bInfo.id]) {
		if (!cache[mInfo.id]) 
			load(mInfo, cache, pwd, cache[bInfo.id][bInfo.sub]);
		// NOTE The callback should always be called asynchronously to ensure
		//      that a cached call won't differ from an uncached one.
		if (callback) setTimeout(function(){callback(cache[mInfo.id])}, 0);
		return cache[mInfo.id];
	}
	
	var hook = null;
	var request = new XMLHttpRequest();

	if (callback) request.onreadystatechange = onReadyStateChange;
	request.open('GET', bInfo.uri, !!callback);
	request.send();
	if (!callback) onReadyStateChange();	

	return hook;
	
	function onReadyStateChange() {
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
	}
}

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';

// NOTE Older browsers (including IE8) don't know about defineProperty, so we
//      have to use the unsave method as fallback in these cases.
try {
	Object.defineProperty(require, 'resolve', {'value':resolve,'writable':false,'configurable':false});
	Object.defineProperty(window, 'require', {'value':require,'writable':false,'configurable':false});
}
catch(e) {
	require.resolve = resolve;
	window.require = require;
}

// INFO Module loader
// NOTE This functions is defined as an anonymous function, which is passed a
//      a parameter to the closure above, to provide a clean environment (only
//      global variables, module and exports) for the loaded module. This is
//      also the reason why cache, pwd and source aren't named parameters.
})(function(module/*, cache, pwd, source*/) {
	var exports = arguments[1][module.id] = new Object();
	arguments[2].unshift(module.id.match(/^.*\//)[0]);
	eval('('+arguments[3]+')();\n//@ sourceURL='+module.uri+'\n');
	arguments[2].shift();
});
