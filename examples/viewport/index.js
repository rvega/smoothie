'use strict';

var vp = require('1:widgets/viewport');

var bodyViewport = null;
var blockViewport = null;
var bodyTransform = new vp.Matrix2D();
var blockTransform = new vp.Matrix2D(-1,0, 0,-1, 0,0);
// NOTE Some transformation matrices:
//      var transform = new vp.Matrix2D();
//      var transform = new vp.Matrix2D(0,-1, 1,0, 0,0);
//      var transform = new vp.Matrix2D(-1,0, 0,-1, 0,0);
//      var transform = new vp.Matrix2D(0,1, -1,0, 0,0);
//      var transform = new vp.Matrix2D(0.766,-0.643, 0.643,0.766, -750,-1250);
//      var transform = new vp.Matrix2D(0.5,0, 0,0.5, 0,0);
//      var transform = new vp.Matrix2D(2,0, 0,2, 0,0);
//      var transform = new vp.Matrix2D(3,0, 0,0.2, -750,-1250);
//      var transform = new vp.Matrix2D(0.433013,-0.25, 0.25,0.433013, 0,0);
//      var transform = new vp.Matrix2D(1.73205,-1, 1,1.73205, 0,0);
//      var transform = new vp.Matrix2D(0.433013,-1, 0.25,1.73205, -750,-1250);

function addButtonEvents() {
	document.getElementById('BodyLeft').addEventListener('click', transiteBodyLeft, false);
	document.getElementById('BodyRight').addEventListener('click', transiteBodyRight, false);
	document.getElementById('BodyTop').addEventListener('click', transiteBodyTop, false);
	document.getElementById('BodyBottom').addEventListener('click', transiteBodyBottom, false);
	document.getElementById('BlockLeft').addEventListener('click', transiteBlockLeft, false);
	document.getElementById('BlockRight').addEventListener('click', transiteBlockRight, false);
	document.getElementById('BlockTop').addEventListener('click', transiteBlockTop, false);
	document.getElementById('BlockBottom').addEventListener('click', transiteBlockBottom, false);
}

function transite(viewport, mode, start) {
	var transition = {
		'mode':mode,
		'start':start
	}


	function reinit(evt) {
		viewport.last.parentNode.removeChild(viewport.last);
		if (viewport.node == bodyViewport.node)
			blockViewport.init(viewport.views[0].getElementsByClassName('Viewport')[0]);
		addButtonEvents();
		viewport.node.removeEventListener('viewchange', reinit, false);
	}

	viewport.views[0].parentNode.appendChild(viewport.views[0].cloneNode(true));
	viewport.node.addEventListener('viewchange', reinit, false);
	viewport.next(transition);
}
function transiteBodyLeft() { transite(bodyViewport, 'from-left', bodyTransform); }
function transiteBodyRight() { transite(bodyViewport, 'from-right', bodyTransform); }
function transiteBodyTop() { transite(bodyViewport, 'from-top', bodyTransform); }
function transiteBodyBottom() { transite(bodyViewport, 'from-bottom', bodyTransform); }
function transiteBlockLeft() { transite(blockViewport, 'from-left', blockTransform);}
function transiteBlockRight() { transite(blockViewport, 'from-right', blockTransform); }
function transiteBlockTop() { transite(blockViewport, 'from-top', blockTransform); }
function transiteBlockBottom() { transite(blockViewport, 'from-bottom', blockTransform); }

exports.interactive = function() {
	var viewports = document.getElementsByClassName('Viewport');
	console.log(viewports);
	bodyViewport = new vp.Viewport(viewports[0]);
	blockViewport = new vp.Viewport(viewports[1]);
	addButtonEvents();
}
