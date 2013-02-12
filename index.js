(function() {
// NOTE If we would use strict mode for this closure we won't allow the paths
//      to be executed in normal mode.

function require(path, callback) {
	var rpath = require.resolve(path);
	var url = rpath.prefixed?rpath.url:'/js_modules/'+rpath.url; 

	if (require.cache[url]) {
		// NOTE The callback should always be called asynchronously
		callback && setTimeout(function(){callback(require.cache[url])}, 0);
		return require.cache[url];
	}
	
	var exports = new Object();
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (this.readyState != 4)
			return;
		if (this.status != 200)
			throw 'Require() exception: GET '+url+' '+this.status+' ('+this.statusText+')';


		if (require.cache[url]) {
			exports = require.cache[url];
		}
		else if (this.getResponseHeader('content-type').indexOf('application/json') != -1) { 
			exports = JSON.parse(this.responseText);
			require.cache[url] = exports;
		}
		else {
			require.cache[url] = exports;
			var source = this.responseText.match(/^\s*(?:(['"]use strict['"])(?:;\r?\n?|\r?\n))?\s*((?:.*\r?\n?)*)/);
			eval('(function(){'+source[1]+';var exports=require.cache[\''+url+'\'];\n\n'+source[2]+'\n})();\n//@ sourceURL='+url+'\n');
		}

		callback && callback(require.cache[url]);
	};
	request.open('GET', url, !!callback);
	request.send();
	return exports;
}

require.resolve = function(path) {
	var m = path.match(/^((?:\.{0,2}\/)?)((?:.*?\/)*)([^@].*?)?(\..*?)?(?:@(.*?))?$/);
	return {
		'url': m[1]+m[2]+(m[3]?m[3]+(m[4]?m[4]:'.js'):'index.js'),
		'module': m[5],
		'prefixed': !!m[1]
	};
}

// INFO initializing cache
require.cache = new Object();

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';
window.require = require;

})();
