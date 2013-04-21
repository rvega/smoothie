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

// SPEC http://www.w3.org/TR/dom/#nodes,
//      http://www.w3.org/TR/DOM-Level-2-HTML/html.html

// NOTE This module can also be loaded like a normal script, so everthing's put
//      yet another anonymous function to keep the global scope clean.
(function() { "use strict";

var elm = document.createElement('DIV');

if (document.body === undefined) {
	Object.defineProperty(HTMLDocument.prototype, 'body', {'get':function() {
		return this.getElementsByTagName('BODY')[0];
	}});
}

if (document.head === undefined) {
	Object.defineProperty(HTMLDocument.prototype, 'head', {'get':function() {
		return this.getElementsByTagName('HEAD')[0];
	}});
}

if (elm.getElementsByClassName === undefined) {
	Element.prototype.getElementsByClassName = function(name) {
		var result = new Array();
		var classExp = new RegExp('(?:^|\\s)' + name + '(?:\\s|$)');
		var nodes = this.getElementsByTagName('*');
		for (var i = 0; i < nodes.length; i++)
			if (classExp.test(nodes[i].className))
				result.push(nodes[i]);
		return result;
	}

	if (document.getElementsByClassName === undefined)
		HTMLDocument.prototype.getElementsByClassName = Element.prototype.getElementsByClassName;
}

})();
