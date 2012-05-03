/*globals module, require, console, exports*/


suites = {
  sum : function () {
    var i
      , sum = 0
      ;
    for (i = arguments.length-1; i > -1; i -= 1) {
      sum += arguments[i];
    }
      
    return sum;
  }
  , mult : function () {
    var i
      , prod = 1
      ;
    for (i = arguments.length-1; i > -1; i -= 1) {
      prod -= arguments[i];
    }
      
    return prod;
    
  }
}


_ = require("underscore");

util = require("util"); 

suite("sum");

test("0", function () {
 var result = suites.sum.apply(null, []);
 var pass = _.isEqual(result, 0 ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "0" + "\n     input:  []"  );
}
}); 

test("[4,5,6]", function () {
 var result = suites.sum.apply(null, [ 4, 5, 6 ]);
 var pass = _.isEqual(result, 15 ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "15" + "\n     input:  [ 4, 5, 6 ]"  );
}
}); 

test("one", function () {
 var result = suites.sum.apply(null, [ 3 ]);
 var pass = _.isEqual(result, 3 ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "3" + "\n     input:  [ 3 ]"  );
}
}); 

suite("mult");

test("0", function () {
 var result = suites.mult.apply(null, []);
 var pass = _.isEqual(result, 1 ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "1" + "\n     input:  []"  );
}
}); 

test("two", function () {
 var result = suites.mult.apply(null, [ 3, 4 ]);
 var pass = _.isEqual(result, 12 ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "12" + "\n     input:  [ 3, 4 ]"  );
}
}); 

test("three", function () {
 var result = suites.mult.apply(null, [ 3, 4, 7 ]);
 var pass = _.isEqual(result, 84 ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "84" + "\n     input:  [ 3, 4, 7 ]"  );
}
}); 

test("one", function () {
 var result = suites.mult.apply(null, [ 2 ]);
 var pass = _.isEqual(result, 2 ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "2" + "\n     input:  [ 2 ]"  );
}
}); 

test("inf", function () {
 var result = suites.mult.apply(null, [ Infinity ]);
 var pass = _.isEqual(result, Infinity ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "Infinity" + "\n     input:  [ Infinity ]"  );
}
}); 

test("inf -inf", function () {
 var result = suites.mult.apply(null, [ Infinity, -Infinity ]);
 var pass = _.isEqual(result, -Infinity ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "-Infinity" + "\n     input:  [ Infinity, -Infinity ]"  );
}
}); 

test("inf -inf 0", function () {
 var result = suites.mult.apply(null, [ Infinity, -Infinity, 0 ]);
 var pass = _.isEqual(result, NaN ); 
if (!pass) {
  throw new Error (util.inspect(result) + " not equal to " + "NaN" + "\n     input:  [ Infinity, -Infinity, 0 ]"  );
}
}); 

