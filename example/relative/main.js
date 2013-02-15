'use strict';

var sub = require('./sub.js');

var hellostr = 'hello';

exports.name = 'Main';

exports.greet = function() {
	return hellostr+' from '+exports.name+' & '+sub.name+'!';
}
