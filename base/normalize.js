(function() {

function test(code, fix) {
	try {
		code();
	}
	catch (e) {
		fix(e);
		try {
			code();
		}
		catch (e) {
			throw 'Smoothie normalize exception: unable to fix: '+e;
		}
	}

}

// INFO DOMTokenList (fixes Element.classList etc)

test(function() {
	DOMTokenList;
}, function() {
	window.DOMTokenList = function() {
		if (this.init && (this.init(arguments[0], arguments[1])||true)) return;
		var proto =  window.DOMTokenList.prototype;

		proto.init = function(node, list) {
			this.$node = node;
			this.$list = list;
		}

		proto.item = function(idx) {
			throw 'Smoothie normalize exception: TODO DOMTokenList.init';
		}
		proto.contains = function(token) {
			throw 'Smoothie normalize exception: TODO DOMTokenList.contains';
		}		
		proto.add = function(token) {
			var rx = new RegExp('(?:(?:^|\\s)\\s*'+token+'\\s*(?:$|\\s)|\\s*$)');
			console.log(this.$node[this.$list]);
			this.$node[this.$list] = this.$node[this.$list].replace(rx, ' '+token+' ');
			console.log(this.$node[this.$list]);
		}		
		proto.remove = function(token) {
			var rx = new RegExp('(?:^|\\s)\\s*'+token+'\\s*(?:$|\\s)');
			this.$node[this.$list] = this.$node[this.$list].replace(rx, ' ');
		}
		proto.toggle = function(token) {
			throw 'Smoothie normalize exception: TODO DOMTokenList.toggle';
		}

		this.init(arguments[0], arguments[1]);
	}

	Object.defineProperty(HTMLElement.prototype, 'classList', {'get':function() {
		// NOTE This only works, because we don't return the value stored in 
		//      this.classList but the resulting instance of the "new" call here
		//      (the instance is stored in this.classList on the fly). Splitting
		//      this line into two would cause an infinite loop, since we would
		//      try to get the value stored in this.classList, which would call
		//      the getter function from within the getter function.
		return this.classList = new window.DOMTokenList(this, 'className');
	}});
});

// INFO CSSStyleSheet and related objects

try {
	var sheet = document.head.insertBefore(document.createElement('STYLE'), document.head.firstChild).sheet;
	var cssPrefix = window.webkitRequestAnimationFrame?'-webkit-':'';
	sheet.insertRule('@'+cssPrefix+'keyframes ViewportAnimation {}', 0);
	var animation = sheet.cssRules[0];

	test(function() {
		animation.appendRule('0% {}');
	}, function() {
		if (window.WebKitCSSKeyframesRule && WebKitCSSKeyframesRule.prototype.insertRule)
			WebKitCSSKeyframesRule.prototype.appendRule = WebKitCSSKeyframesRule.prototype.insertRule;
		else if (window.MozCSSKeyframesRule && MozCSSKeyframesRule.prototype.insertRule)
			MozCSSKeyframesRule.prototype.appendRule = MozCSSKeyframesRule.prototype.insertRule;
	});

	test(function() {
		animation.deleteRule('0%');
	}, function(e) {
		if (e == 'Error: Invalid argument.') {
			CSSKeyframesRule.prototype.$deleteRule = CSSKeyframesRule.prototype.deleteRule;
			CSSKeyframesRule.prototype.deleteRule = function(key) {
				var k = parseInt(key)/100;
				this.$deleteRule(k);
			}
		}
	});

	document.head.removeChild(document.head.firstChild);
}
catch (e) {
	console.log(e);
}

})();
