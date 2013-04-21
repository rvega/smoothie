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

// SPEC http://www.w3.org/TR/dom/#events

// TODO The implemetation is pretty quick'n'dirty - check with the specs!
//      Reimplemnt without using MS legacy events

// NOTE This module can also be loaded like a normal script, so everthing's put
//      yet another anonymous function to keep the global scope clean.
(function() { "use strict";

var elm = document.createElement('DIV');

if (document.createEvent === undefined) {
	HTMLDocument.prototype.createEvent = function(type) {
		return document.createEventObject();
	}
}

if (elm.dispatchEvent == undefined) { 
	Element.prototype.dispatchEvent = function(evt) {
		try {
			this.fireEvent('on'+evt.$name);
		}
		catch (e) {
			if (this.listeners && this.listeners[evt.$name])
				for (handler in this.listeners[evt.$name])
					handler.apply(this, evt);
		}
	}
	
	if (window.dispatchEvent === undefined)
		window.dispatchEvent = Element.prototype.dispatchEvent;
}

if (elm.addEventListener == undefined) { 
	Element.prototype.addEventListener = function(name, func, capture) {
		if (!this.listeners)
			this.listeners = new Object();
		if (!this.listeners[name])
			this.listeners[name] = new Array();
		this.listeners[name].push(func);
		this.attachEvent('on'+name, func);
	}

	if (window.addEventListener === undefined)
		window.addEventListener = Element.prototype.addEventListener;
}

if (elm.removeEventListener == undefined) { 
	Element.prototype.removeEventListener = function(name, func) {
		for (var i = 0; i < this.listeners[name].length; i++)
			if (this.listeners[name][i] == func) {
				this.listeners[name] = this.listeners[name].splice(i, 1);
				break;
			}
		this.detachEvent('on'+name, func);
	}

	if (window.removeEventListener === undefined)
		window.removeEventListener = Element.prototype.removeEventListener;
}

var evt = document.createEvent('Event');

if (evt.initEvent == undefined) { 
	Event.prototype.initEvent = function(name, bubbles, cancelable) {
		this.$name = name;
	}
}

})();
