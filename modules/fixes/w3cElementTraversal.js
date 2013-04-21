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

// INFO See http://www.w3.org/TR/ElementTraversal/

// NOTE This module can also be loaded like a normal script, so everthing's put
//      yet another anonymous function to keep the global scope clean.
(function() { "use strict";

var elm = document.createElement('DIV');

if (elm.firstElementChild === undefined) {
	Object.defineProperty(Element.prototype, 'firstElementChild', {'get':function() {
		return this.children[0];			
	}});
}

if (elm.lastElementChild === undefined) {
	Object.defineProperty(Element.prototype, 'lastElementChild', {'get':function() {
		return this.children[this.children.length-1];			
	}});
}

if (elm.previousElementSibling === undefined) {
	Object.defineProperty(Element.prototype, 'previousElementSibling', {'get':function() {
		var node = this.previousSibling;
		while (node) {
			if (node.nodeType == 1)
				return node;
			node = node.nextSibling;
		}
		return null;			
	}});
}

if (elm.nextElementSibling === undefined) {
	Object.defineProperty(Element.prototype, 'nextElementSibling', {'get':function() {
		var node = this.nextSibling;
		while (node) {
			if (node.nodeType == 1)
				return node;
			node = node.nextSibling;
		}
		return null;			
	}});
}

if (elm.childElementCount === undefined) {
	Object.defineProperty(Element.prototype, 'childElementCount', {'get':function() {
		return this.children.length;			
	}});
}

})();
