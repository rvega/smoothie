// NOTE The load parameter points to the function, which prepares the
//      environment for each module and runs its code. Scroll down to the end of
//      the file to see the function definition.
(function(load) { 'use strict';

// INFO Module root
var root = location.pathname;
// INFO Module path (0 = current)
var pwd = Array('');
// INFO Module cache
var cache = new Object();
// INFO Path parser
var parser = document.createElement('A');

function require(path, callback) {
	var module = require.resolve(path);

	var terms = module.id.split('/');;
	for (var i = terms.length; i > 0; i--) {
		var bundle = terms.slice(0,i).join('/');  
		if (cache[bundle]) {
			for (; i < terms.length; i++) {
				var m = require.resolve(bundle+'/'+terms[i]);
				if (!cache[bundle][terms[i]])
					throw 'require() exception: '+terms[i]+' not found in bundle '+bundle;
				load(m, cache, pwd, cache[bundle][terms[i]]);
				bundle = m.id;
			}
			// NOTE The callback should always be called asynchronously to ensure
			//      that a cached call won't differ from an uncached one.
			callback && setTimeout(function(){callback(cache[module.id])}, 0);
			return cache[module.id];
		}
	}
	cache[module.id] = null;
	
	var request = new XMLHttpRequest();
	request.open('GET', module.uri, !!callback);
	request.send();
	request.onload = callback?onLoad:onLoad();
	return cache[module.id];
	
	function onLoad() {
		if (request.status != 200)
			throw 'require() exception: GET '+module.uri+' '+request.status+' ('+request.statusText+')';
		if (!cache[module.id]) { 
			load(module, cache, pwd, 'function(){\n'+request.responseText+'\n}');
		}
		callback && callback(cache[module.id]);
	}
}

require.resolve = function(path) {
	var m = path.match(/^(\.\.?)?\/?((?:.*\/)?)([^\.]+)?(\..*)?$/);
	parser.href = '/'+((m[1]?pwd[0]+m[1]+'/':'')+m[2])+(m[3]?m[3]:'index');
	return {
		'id': parser.href.replace(/^[^:]*:\/\/[^\/]*\/|\/(?=\/)/g, ''),
		'uri': root+parser.href.replace(/^[^:]*:\/\/[^\/]*\//, '')+(m[4]?m[4]:'.js')
	};
}

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';
window.require = require;

// INFO Module loader
// NOTE This functions is defined as an anonymous function, which is passed a
//      a parameter to the closure above, to provide a clean environment (only
//      global variables, module and exports) for the loaded module. This is
//      also the reason why 'source' is not a named parameter.
})(function(module/*, cache, pwd, source*/) {
	var exports = arguments[1][module.id] = new Object();
	arguments[2].unshift(module.id.match(/(?:.*\/)?/)[0]);
	eval('('+arguments[3]+')();\n//@ sourceURL='+module.uri+'\n');
	arguments[2].shift();
});
