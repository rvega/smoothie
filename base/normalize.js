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
			console.log('Smoothie normalize exception: unable to fix: '+e);
		}
	}

}

// INFO Event handling for IE8

if (!window.addEventListener && window.attachEvent) {
	document.createEvent = function(type) {
		return document.createEventObject();
	}

	Event.prototype.initEvent = function(name, bubbles, cancelable) {
		this.expando = name;
		this.cancelBubble = bubbles;
	}
	
	window.dispatchEvent = Element.prototype.dispatchEvent = function(evt) {
		try {
			this.fireEvent('on'+evt.expando);
		}
		catch (e) {
			if (this.listeners && this.listeners[evt.expando])
				this.listeners[evt.expando](evt);
		}
	}

	window.addEventListener = Element.prototype.addEventListener = function(name, func, capture) {
		if (!this.listeners)
			this.listeners = new Object();
		this.listeners[name] = func;
		this.attachEvent('on'+name, func);
	}

	window.removeEventListener = Element.prototype.removeEventListener = function(name, func, capture) {
		this.listeners[name] = null;
		this.detachEvent('on'+name, func);
	}
}

// INFO DOMTokenList for IE8/9 (needed for Element.classList etc)

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
			this.$node[this.$list] = this.$node[this.$list].replace(rx, ' '+token+' ');
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
});

// INFO DOM nodes and elements

try {
	var elm = document.createElement('DIV');

	if (!elm.nextElementSibling && (elm.nextSibling !== undefined)) {
		Object.defineProperty(Element.prototype, 'nextElementSibling', {'get':function() {
			var elm = this.nextSibling;
			while (elm) {
				if (elm.nodeType == 1)
					return elm;
				elm = elm.nextSibling;
			}
			return null;			
		}});
	}

	test(function() {
		elm.getElementsByClassName('Foobar');
	}, function() {
		document.getElementsByClassName = Element.prototype.getElementsByClassName = function(name) {
			var result = new Array();
			var classExp = new RegExp('(?:^|\\s)' + name + '(?:\\s|$)');
			var nodes = this.getElementsByTagName('*');
			for (var i = 0; i < nodes.length; i++)
				if (classExp.test(nodes[i].className))
					result.push(nodes[i]);
			return result;
		}
	});

	test(function() {
		elm.classList.add('Test');
	}, function() {
		Object.defineProperty(Element.prototype, 'classList', {'get':function() {
			// NOTE This only works, because we don't return the value stored in 
			//      this.classList but the resulting instance of the "new" call here
			//      (the instance is stored in this.classList on the fly). Splitting
			//      this line into two would cause an infinite loop, since we would
			//      try to get the value stored in this.classList, which would call
			//      the getter function from within the getter function.
			return this.classList = new window.DOMTokenList(this, 'className');
		}});
	});
}
catch (e) {
	console.log('Smoothie normalize exception: Element unsupported: '+e);
}

// INFO CSSStyleSheet and related objects

try {
	var sheet = document.head.insertBefore(document.createElement('STYLE'), document.head.firstChild).sheet;
	sheet.insertRule('@'+(window.webkitRequestAnimationFrame?'-webkit-':'')+'keyframes ViewportAnimation {}', 0);
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
				var k = key=='from'?0:key=='to'?1:parseInt(key)/100;
				this.$deleteRule(k);
			}
		}
	});

	document.head.removeChild(document.head.firstChild);
}
catch (e) {
	console.log('Smoothie normalize exception: CSSStyleSheet unsupported: '+e);
}


if (document.head === undefined)
	Object.defineProperty(document, 'head', {'get':function() {
		return this.getElementsByTagName('HEAD')[0];
	}});
if (document.body === undefined)
	Object.defineProperty(document, 'body', {'get':function() {
		return this.getElementsByTagName('BODY')[0];
	}});

})();
