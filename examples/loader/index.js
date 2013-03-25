'use strict';

exports.loading = function() {
	console.log('Hello from loading hook\n');
	//document.getElementById('HookOutput').innerHTML += 'Hello from loading hook\n';
}

exports.interactive = function() {
	console.log('Hello from interactive hook\n');
	document.getElementById('HookOutput').innerHTML += 'Hello from interactive hook\n';
}

exports.complete = function() {
	console.log('Hello from complete hook\n');
	document.getElementById('HookOutput').innerHTML += 'Hello from complete hook\n';
}
