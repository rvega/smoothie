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

// SPEC http://www.w3.org/TR/css3-animations/

// NOTE This module can also be loaded like a normal script, so everthing's put
//      yet another anonymous function to keep the global scope clean.
(function() { "use strict";

try {
	var sht = document.head.insertBefore(document.createElement('STYLE'), document.head.firstChild).sheet;
	sht.insertRule('@'+(window.webkitRequestAnimationFrame?'-webkit-':'')+'keyframes ViewportAnimation {}', 0);
	var ani = sht.cssRules[0];

	if (ani.appendRule === undefined) {
		if (window.WebKitCSSKeyframesRule && WebKitCSSKeyframesRule.prototype.insertRule)
			WebKitCSSKeyframesRule.prototype.appendRule = WebKitCSSKeyframesRule.prototype.insertRule;
		else if (window.MozCSSKeyframesRule && MozCSSKeyframesRule.prototype.insertRule)
			MozCSSKeyframesRule.prototype.appendRule = MozCSSKeyframesRule.prototype.insertRule;
	}

	try {
		ani.deleteRule('0%');
	}
	catch (e) {
		CSSKeyframesRule.prototype.$deleteRule = CSSKeyframesRule.prototype.deleteRule;
		CSSKeyframesRule.prototype.deleteRule = function(key) {
			var k = key=='from'?0:key=='to'?1:parseFloat(key)/100;
			this.$deleteRule(k);
		}
	}

	document.head.removeChild(document.head.firstChild);
}
catch (e) {
	console.log('Smoothie w3cCssAnimations exception: Interface unsupported');
}

})();
