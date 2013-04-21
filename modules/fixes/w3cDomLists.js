//
// This file is part of Smoothie.
//
// Smoothie is free software: you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Smoothie is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
// details.You should have received a copy of the GNU Lesser General Public
// License along with Smoothie.  If not, see <http://www.gnu.org/licenses/>.
//
////////////////////////////////////////////////////////////////////////////////

// SPEC http://www.w3.org/TR/dom/#lists

// NOTE This module can also be loaded like a normal script, so everthing's put
//      yet another anonymous function to keep the global scope clean.
(function() { "use strict";

var elm = document.createElement('DIV');

if (window.DOMTokenList === undefined) {
	// NOTE length property missing since IE8 doesn't support getters/setters
	//      for non-Element objects.
	window.DOMTokenList = function() {
		if (this.init && (this.init(arguments[0], arguments[1])||true)) return;
		var proto =  window.DOMTokenList.prototype;

		proto.init = function(node, list) {
			this.$node = node;
			this.$list = list;
		}

		proto.item = function(idx) {
			throw 'Smoothie w3cDomLists exception: TODO DOMTokenList.init';
		}
		proto.contains = function(token) {
			throw 'Smoothie w3cDomLists exception: TODO DOMTokenList.contains';
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
			throw 'Smoothie w3cDomLists exception: TODO DOMTokenList.toggle';
		}

		this.init(arguments[0], arguments[1]);
	}
}

if (window.DOMSettableTokenList === undefined) {
	// NOTE value property missing since IE8 doesn't support getters/setters
	//      for non-Element objects.
	window.DOMSettableTokenList = function() {
		if (this.init && (this.init(arguments[0], arguments[1])||true)) return;
		var proto = window.DOMSettableTokenList.prototype;

		this.init(arguments[0], arguments[1]);
	}
	window.DOMSettableTokenList.prototype = new DOMTokenList();
}

if (elm.classList === undefined) {
	Object.defineProperty(Element.prototype, 'classList', {'get':function() {
		if (!this.$classList)
			this.$classList = new window.DOMSettableTokenList(this, 'className');
		return this.$classList;
	}});
}

})();
