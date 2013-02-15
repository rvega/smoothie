//
// program.js
//

var print;
if (this.print) {
    print = this.print;
} else if (sys.print) {
    print = sys.print;
} 
else if (typeof alert !== "undefined") {
    print = alert;
}

print("test");

var inc = require('increment').increment;
var a = 1;
print("inc(" + a + ") = " + inc(a))

