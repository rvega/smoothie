"use strict";

exports.required = function() {
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
		var result = (context.getImageData(5, 8, 1, 1).data[3] == 255);
		document.head.removeChild(canvas);
		return result;
	}
	catch (e) {
		// NOTE Ignore any errors, which might occur.
		throw e;
	}

}

exports.filter = function(rule) {
	// NOTE Only affect rules that have a src value (AFAIK
	//      this is only true for CSSFontfaceRule objects).
	return (rule.style && rule.style.src);
}

exports.fix = function(rule) {
	// NOTE Use SVG as the preferred source format if available. All other
	//      formats follow in their original order. Do nothing if a SVG source
	//      is not defined.
	rule.style.src = rule.style.src.replace(/^([^;]*),([^,]*svg[^,;]*)([^;]*)/g, '$2,$1$3');
	// NOTE Opera needs the rule to be deleted and inserted again
	//      (in that order) to apply it to the document.
	if (window.opera) {
		var sheet = rule.parentStyleSheet;
		var text = rule.cssText;
		// NOTE Find the index of the rule in the sheet's rule list.
		for (var i = 0; rule != sheet.cssRules[i]; i++);
		sheet.deleteRule(i);
		sheet.insertRule(text, i);
	}
}

exports.apply = function() {
	if (!exports.required())
		return;

	// NOTE Circle through all CSS sheets of the document and traverse
	//      through their rules.
	for (var sheet, i = 0;  (sheet = document.styleSheets[i]); i++)
		traverseRules(sheet);
	
	// NOTE Circle through all CSS rules of a sheet and try to fix them.
	//      Traverse the rule's subsheet if it exists.
	function traverseRules(sheet) {
		for (var rule, j = 0; sheet && (rule = sheet.cssRules[j]); j++) {
			if (exports.filter(rule))
				exports.fix(rule);
			traverseRules(rule.styleSheet);
		}
	}
}
