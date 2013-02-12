'use strict';

var hellostr = 'hello';

exports.worldstr = 'world';

exports.greet = function() {
	return hellostr+' '+exports.worldstr+'!';
}
