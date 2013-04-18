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

'use strict';

// INFO CSS helper classes
// TODO Get rid of these or move them into a separate module

var cssPrefix = window.webkitRequestAnimationFrame?'-webkit-':'';

var Vector2D = function(x, y) {
	if (this.init && (this.init(arguments[0],arguments[1])||true)) return;
	var proto = Vector2D.prototype;

	proto.init = function(x,y) {
		if (typeof x == 'object') {
			this.x = x.x;
			this.y = x.y;
		}
		else {
			this.x = !isNaN(x)?x:0;
			this.y = !isNaN(y)?y:0;
		}
	}

	proto.add = function(v) {
		return new Vector2D(
			this.x + v.x,
			this.y + v.y
		);
	}

	proto.sub = function(v) {
		return new Vector2D(
			this.x - v.x,
			this.y - v.y
		);
	}

	proto.mul = function(v) {
		if (v && v.x !== undefined)
			return this.x*v.x + this.y*v.y;
		else
			return new Vector2D(
				this.x * v,
				this.y * v
			);
	}

	proto.css = function() {
		if (window.opera !== undefined)
			return 'matrix(1,0 0,1, '+this.x+','+this.y+')';
		else
			return 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, '+this.x+','+this.y+',0,1)';
	}

	this.init(arguments[0],arguments[1])
}

var Matrix2D = function() {
	if (this.init && (this.init(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])||true)) return;
	var proto = Matrix2D.prototype;
	
	proto.init = function(a1,b1, a2,b2, x,y) {
		if (typeof a1 == 'object') {
			this.a1 = a1.a1; this.b1 = a1.b1;
			this.a2 = a1.a2; this.b2 = a1.b2;
			this.x = a1.x;
			this.y = a1.y;
		}
		else {
			this.a1 = !isNaN(a1)?a1:1; this.b1 = !isNaN(b1)?b1:0;
			this.a2 = !isNaN(a2)?a2:0; this.b2 = !isNaN(b2)?b2:1;
			this.x = !isNaN(x)?x:0;
			this.y = !isNaN(y)?y:0;
		}
	}

	proto.mul = function(r) {
		if (r && r.x !== undefined)
			return new Vector2D(
				this.a1*r.x + this.b1*r.y,
				this.a2*r.x + this.b2*r.y
			);
		else
			return new Matrix2D(
				this.a1*r.a1 + this.b1*r.a2,
				this.a1*r.b1 + this.b1*r.b2,
				this.a2*r.a1 + this.b2*r.a2,
				this.a2*r.b1 + this.b2*r.b2,
				this.a1*r.x + this.b1*r.y + this.x,
				this.a2*r.x + this.b2*r.y + this.y
			);
	}

	proto.det = function() {
		return   this.a1*this.b2*1 /*+ this.b1*this.y*0 + this.x*this.a2*0
			   - this.x*this.b2*0*/ - this.b1*this.a2*1 /*- this.a1*this.y*0*/;
	}

	proto.invert = function() {
		/*da1 = this.b2*1       - this.y*0;
		db1 = this.x*0       - this.b1*1;
		dx = this.b1*this.y - this.x*this.b2;
		da2 = this.y*0       - this.a2*1;
		db2 = this.a1*1       - this.x*0;
		dy = this.x*this.a2 - this.a1*this.y;
		dc1 = this.a2*0       - this.b2*0;
		dc2 = this.b1*0       - this.a1*0;
		dc3 = this.a1*this.b1 - this.a2*this.b2;*/

		var i = 1/this.det();
		return new Matrix2D(
			i*this.b2, i*(-this.b1),
			i*(-this.a2), i*this.a1,
			i*(this.b1*this.y - this.x*this.b2),
			i*(this.x*this.a2 - this.a1*this.y)
		);
	}

	proto.css = function() {
		if (window.opera !== undefined)
			return 'matrix('+this.a1+','+this.a2+','+this.b1+','+this.b2+','+this.x+','+this.y+')';
		else
			return 'matrix3d('+this.a1+','+this.a2+',0,0,'+this.b1+','+this.b2+',0,0,0,0,1,0,'+this.x+','+this.y+',0,1)';
	}

	this.init(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);
}

// INFO Viewport class

function Viewport() {
	if (this.init && (this.init(arguments[0])||true)) return;
	var proto =  Viewport.prototype;

	proto.init = function(node) {
		this.node = node;
		this.spreader = this.node.getElementsByClassName('Spreader')[0];
		this.frame = this.node.getElementsByClassName('Frame')[0];
		this.views = this.frame.children;
		this.current = this.views[0];
		this.current.className = 'View active';
	}

	// NOTE Using an own styleSheet object keeps the global scope
	//      clean and seems to fix a bug in Opera, which only
	//      applies a CSSKeyframesRule if this is part of a
	//      CSSStyleSheet, which has been created dynamically. 
	proto.styleSheet = document.head.insertBefore(document.createElement('STYLE'), document.head.firstChild).sheet;
	try {
		proto.styleSheet.insertRule('@'+cssPrefix+'keyframes ViewportAnimation {}', 0);
		proto.animation = proto.styleSheet.cssRules[0];
	}
	catch (e) {
		console.log('Smoothie viewport: animations disabled');
	}

	proto.blend = function(viewFrom, viewTo, transition, callback) {
		var self = this;
		var transformFrom = new Matrix2D();
		var transformTo = new Matrix2D(transition.start); // clone matrix
		var offsetFrom = new Matrix2D();
		var offsetTo = transformTo.invert();

		function animationEnd() {
			function cleanup() {
					viewTo.style[cssPrefix+'transform'] = '';
					self.spreader.style['height'] = '';
					self.spreader.style['width'] = '';
					self.frame.style['position'] = '';
					self.frame.style['height'] = '';
					self.frame.style['width'] = '';
					// self.frame.style[cssPrefix+'animationName'] = '';
					self.node.classList.remove('animated');
					callback();
			}
		
			if (self.node == document.body) {
				window.scrollTo(scrollTo.left, scrollTo.top);
				setTimeout(cleanup, 0);
			}
			else {
				self.node.scrollLeft = scrollTo.left;
				self.node.scrollTop = scrollTo.top;
				cleanup();
			}
			
			self.frame.removeEventListener('animationend', animationEnd, false);
			self.frame.removeEventListener('webkitAnimationEnd', animationEnd, false);
			self.frame.removeEventListener('oAnimationEnd', animationEnd, false);
		}

		this.frame.style['height'] = this.frame.offsetHeight+'px';
		this.frame.style['width'] = this.frame.offsetWidth+'px';
		this.spreader.style['height'] = (viewTo.offsetHeight+viewFrom.offsetHeight)+'px';
		this.spreader.style['width'] = (viewTo.offsetWidth+viewFrom.offsetWidth)+'px';
		if (this.node == document.body) {
			var scrollFrom = {
				'left': (document.documentElement.scrollLeft||document.body.scrollLeft),
				'top': (document.documentElement.scrollTop||document.body.scrollTop)
			}
			this.frame.style['position'] = 'fixed';
		}
		else {
			var scrollFrom = {
				'left': this.node.scrollLeft,
				'top': this.node.scrollTop
			}
			this.node.scrollLeft = 0;
			this.node.scrollTop = 0;
		}
		var scrollTo = scrollFrom;

		// INFO Position views relative to frame center
		switch(transition.mode) {
			case 'from-left':
				transformFrom.x += 0.5*this.frame.offsetWidth;
				transformFrom.y -= 0.5*(viewFrom.offsetHeight - this.frame.offsetHeight);
				transformTo.x -= viewTo.offsetWidth - 0.5*this.frame.offsetWidth;
				transformTo.y -= 0.5*(viewTo.offsetHeight - this.frame.offsetHeight);
				break;
			case 'from-right':
				transformFrom.x -= viewFrom.offsetWidth - 0.5*this.frame.offsetWidth;
				transformFrom.y -= 0.5*(viewFrom.offsetHeight - this.frame.offsetHeight);
				transformTo.x += 0.5*this.frame.offsetWidth;
				transformTo.y -= 0.5*(viewFrom.offsetHeight - this.frame.offsetHeight);
				break;
			case 'from-top':
				transformFrom.x -= 0.5*(viewFrom.offsetWidth - this.frame.offsetWidth);
				transformFrom.y += 0.5*this.frame.offsetHeight;
				transformTo.x -= 0.5*(viewFrom.offsetWidth - this.frame.offsetWidth);
				transformTo.y -= viewTo.offsetHeight - 0.5*this.frame.offsetHeight;
				break;
			case 'from-bottom':
				transformFrom.x -= 0.5*(viewFrom.offsetWidth - this.frame.offsetWidth);
				transformFrom.y -= viewFrom.offsetHeight - 0.5*this.frame.offsetHeight;
				transformTo.x -= 0.5*(viewFrom.offsetWidth - this.frame.offsetWidth);
				transformTo.y += 0.5*this.frame.offsetHeight;
				break;
		}

		// INFO Calculate frame transforms
		// NOTE Add scrolling and use inverted corner coords as offset
		offsetFrom.x = -(transformFrom.x + scrollFrom.left);
		offsetFrom.y = -(transformFrom.y + scrollFrom.top);
		//var offsetFrom = transformFrom.add(scrollFrom).invert();
		// NOTE Center of frame
		var cb = new Vector2D(0.5*this.frame.offsetWidth, 0.5*this.frame.offsetHeight);
		// NOTE Center of viewFrom
		var cv = new Vector2D(0.5*viewTo.offsetWidth, 0.5*viewTo.offsetHeight);
		// NOTE top-left corner in viewFrom coords
		var l0 = cv.mul(-1);
		// NOTE apply viewFrom rotation
		var l1 = transformTo.mul(l0);
		// NOTE conversion from viewFrom to frame coords
		var g0 = l1.add(cv.sub(cb)).add(transformTo);
		// NOTE Apply frame rotation
		var g1 = offsetTo.mul(g0);
		// NOTE Add scrolling and use inverted corner coords as offset
		offsetTo.x = -(g1.x + cb.x + scrollTo.left);
		offsetTo.y = -(g1.y + cb.y + scrollTo.top);
		//var offsetTo = g1.add(cb).add(scrollTo).invert();

		this.animation.deleteRule('0%');
		this.animation.deleteRule('100%');
		this.animation.appendRule('0% {'+cssPrefix+'transform: '+offsetFrom.css()+';}');
		this.animation.appendRule('100% {'+cssPrefix+'transform:'+offsetTo.css()+';}');

		viewFrom.style[cssPrefix+'transform'] = transformFrom.css();
		viewTo.style[cssPrefix+'transform'] = transformTo.css();
		this.node.classList.add('animated');
		
		this.frame.addEventListener('animationend', animationEnd, false);
		this.frame.addEventListener('webkitAnimationEnd', animationEnd, false);
		this.frame.addEventListener('oAnimationEnd', animationEnd, false);
	}

	proto.show = function(view, transition) {
		var self = this;

		function cleanup() {
			var evt = document.createEvent('Event');
			evt.initEvent('viewchange', true, true);
			evt.lastView = self.current;
			evt.currentView = view;
			self.current.classList.remove('active');
			self.current = view;
			self.node.dispatchEvent(evt);
		}

		this.current.classList.add('active');
		if (this.animation && transition)
			this.blend(this.current, view, transition, cleanup);
		else
			cleanup();
	}

	proto.next = function(transition) {
		var view = this.current.nextElementSibling;
		if (!view)
			view = this.frame.firstElementChild;
		this.show(view, transition);
	}

	proto.prev = function(transition) {
		var view = this.current.previousElementSibling;
		if (!view)
			view = this.frame.lastElementChild;
		this.show(view, transition);
	}

	this.init(arguments[0]);
}

exports.Vector2D = Vector2D;
exports.Matrix2D = Matrix2D;
exports.Viewport = Viewport;
