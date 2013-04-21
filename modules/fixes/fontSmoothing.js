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

// NOTE This module can also be loaded like a normal script, so everthing's put
//      yet another anonymous function to keep the global scope clean.
(function() { "use strict";

function apply() {
	// NOTE Circles through all CSS rules of a sheet and fix them if
	//      necassary.
	function traverseSheet(sheet) {
		for (var rule, j = 0; sheet && (rule = sheet.cssRules[j]); j++) {
			// NOTE Only affect rules that have a src value (AFAIK
			//      this is only true for CSSFontFaceRule objects).
			if (rule.style && rule.style.src) {
				// NOTE Create a new rule where SVG is the preferred
				//      source format and delete the old rule.
				rule.style.src = rule.style.src.replace(/^([^;]*),([^,]*svg[^,;]*)([^;]*)/g, '$2,$1$3');
				// NOTE Opera needs the rule to be deleted and inserted again
				//      (in that order) to apply it to the document.
				if (window.opera) {
					var text = rule.cssText;
					sheet.deleteRule(j);
					sheet.insertRule(text, j);
				}
			}
			traverseSheet(rule.styleSheet);
		}
	}
 
	try {
		// NOTE Safari needs the canvas to be part of the DOM tree to
		//      return correct alpha values.
		var canvas = document.head.appendChild(document.createElement('CANVAS'));
		var context = canvas.getContext('2d');
		context.textBaseline = 'top';
		context.font = '32px Arial';
		context.fillText('O', 0, 0);
		// NOTE We won't check the alpha values of all canvas pixels,
		//      but only the one at position (5,8). If font-smoothing is
		//      off we loop through all CSS rules and fix them.
		for (var sheet, i = 0; (context.getImageData(5, 8, 1, 1).data[3] == 255) && (sheet = document.styleSheets[i]); i++)
			traverseSheet(sheet);
		document.head.removeChild(canvas);
	}
	catch (e) {
		// NOTE Ignore any errors that might occur.
		console.log(e); // DEBUG
	}
}

if (document.readyState == 'complete') {
	apply();
}
else {
	var f = window.onload;
	window.onload = window.onload ? function(evt){f(evt);apply();} : apply;
}

})();
