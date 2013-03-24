(function() {

var mainIdentifier = window.smoothie&&window.smoothie.mainIdentifier?window.smoothie.mainIdentifier:'main';

require(mainIdentifier, function wait(main) {
	if (document.readyState != 'complete')
		return setTimeout(wait, 10, main);
	main.ready();
});

})();
