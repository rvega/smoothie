'use strict'

function LiveListIterator() {
	if (LiveListIterator.prototype.init) return;

	LiveListIterator.prototype.init = function(list, filter) {
		this.list = list;
		this.filter = filter;
		this.index = 0;
		this.cache = undefined;
	}

	LiveListIterator.prototype.item = function(index) {
		if (this.cache || !this.filter) 
			return (this.cache||this.list)[index];
		
		for (var i = 0, j = 0; i < this.list.length; i++) {
			if (this.filter(this.list[i])) {	
				if (j == index)
					return this.list[i];
				j++;
			}
		}
		return undefined;
	}

	LiveListIterator.prototype.length = function() {
		if (this.cache || !this.filter) 
			return (this.cache||this.list).length;
		
		for (var i = 0, j = 0; i < this.list.length; i++) {
			if (this.filter(this.list[i]))
				j++;
		}
		return j;
	}

	LiveListIterator.prototype.first = function() {
		this.index = 0;
		return this.item(this.index);
	}

	LiveListIterator.prototype.prev = function() {
		var i = this.index-1;
		this.index = Math.max(i, 0);
		return this.item(i);		
	}

	LiveListIterator.prototype.next = function() {
		var i = this.index+1;
		this.index = Math.min(i, this.length());
		return this.item(i);		
	}

	LiveListIterator.prototype.last = function() {
		this.index = Math.max(this.length()-1, 0);
		return this.item(this.index);
	}
}

exports.createLiveListIterator = function(list, filter) {
	var o = (new LiveListIterator())
	o.init(list, filter); 
	return o;
}
