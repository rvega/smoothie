(function() {
// NOTE If we would use strict mode for this closure we won't allow the paths
//      to be executed in normal mode.

function require(path, callback) {
	var rpath = require.resolve(path);
	var url = rpath.prefixed?rpath.href:'/js_modules/'+rpath.href; 

	if (require.cache[url] && require.cache[url][0]) {
		if (!require.cache[url][rpath.module]) {
			require.cache[url][rpath.module] = new Object();
			require.cache[url][0][rpath.module](require.cache[url][rpath.module]);
		}
		// NOTE The callback should always be called asynchronously
		callback && setTimeout(function(){callback(require.cache[url][rpath.module])}, 0);
		return require.cache[url][rpath.module];
	}
	require.cache[url] = new Object();
	
	var hook = new Object();
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (this.readyState != 4)
			return;
		if (this.status != 200)
			throw 'Require() exception: GET '+url+' '+this.status+' ('+this.statusText+')';

		if (this.getResponseHeader('content-type').indexOf('application/json') != -1) {
			require.cache[url][rpath.module] = JSON.parse(this.responseText);
			hook = require.cache[url][rpath.module];
		}
		else {
			// TODO Build module object

			if (!require.cache[url][0]) {
				require.cache[url][0] = new Object();
				var source = this.responseText.match(/^\s*(?:(['"]use strict['"])(?:;\r?\n?|\r?\n))?\s*((?:.*\r?\n?)*)/);
				eval('(function(){'+source[1]+';var exports=require.cache[\''+url+'\'][0];\n\n'+source[2]+'\n})();\n//@ sourceURL='+url+'\n');
			}
			if (!require.cache[url][rpath.module]) {
				require.cache[url][rpath.module] = hook;
				require.cache[url][0][rpath.module](require.cache[url][rpath.module]);
			}
			else {
				hook = require.cache[url][rpath.module];
			}
		}

		callback && callback(hook);
	};

	request.open('GET', url, !!callback);
	request.send();
	return hook;
}

require.resolve = function(path) {
	// TODO handle relative paths
	var m = path.match(/^((?:\.{0,2}\/)?)((?:.+?\/)*?)(?:([^\/]+?)(\.[^\/]+)?)?(?:\/\.\/([^\/]+))?$/);
	return {
	 	'href': m[1]+m[2]+(m[3]?m[3]+(m[4]?m[4]:'.js'):'index.js'),
	 	'module': m[5]?m[5]:0,
	 	'prefixed': !!m[1]
	};
}

// INFO initializing cache
require.cache = new Object();

if (window.require !== undefined)
	throw 'RequireException: \'require\' already defined in global scope';
window.require = require;

})();
