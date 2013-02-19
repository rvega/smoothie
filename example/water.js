exports.sea = function() {
	exports.fish = function() {
		exports.greet = function() {
			return "Hello from fish";
		}
	}

	exports.shark = function() {
		exports.greet = function() {
			return "Hello from shark";
		}
	}
}

exports.ocean = function() {
	exports.whale = function() {
		exports.greet = function() {
			return "Hello from whale";
		}
	}

	exports.dolphin = function() {
		exports.greet = function() {
			return "Hello from dolphin";
		}
	}
}
