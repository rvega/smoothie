(function() {

var loaderModule = window.smoothie&&window.smoothie.loaderModule?window.smoothie.loaderModule:'index';
var loaderAsync = window.smoothie&&window.smoothie.loaderAsync?window.smoothie.loaderAsync:true;


function callHooks(m) {
	if (m == null)
		return;

	m.loading && m.loading();
	switch (document.readyState) {
		case 'complete':
			m.interactive && m.interactive();
			m.complete && m.complete();
			break;
		case 'interactive':
			m.interactive && m.interactive();
		case 'loading':
			document.onreadystatechange = function() {
				switch (document.readyState) {
					case 'interactive':
						m.interactive && m.interactive();
						break;
					case 'complete':
						m.complete && m.complete();
						break;
					default:
						throw 'Smoothie loader exception: unknown readyState: '+document.readyState;
				}
			};
			break;
		default:
			throw 'Smoothie loader exception: unknown readyState: '+document.readyState;
	}
};

callHooks(require(loaderModule, loaderAsync && callHooks));

})();
