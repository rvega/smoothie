exports.hello = function() {
	'use strict';

	exports.hellostr = 'hello';

	exports.greet = function() {
		return exports.hellostr+' WORLD';
	}
}

exports.world = function() {
	'use strict';

	exports.worldstr = 'world';

	exports.greet = function() {
		return 'HELLO '+exports.worldstr+'!';
	}
}
