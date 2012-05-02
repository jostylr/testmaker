/*globals module, require, console, exports*/


module.exports.suites = {
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
      sum *= arguments[i];
    }
      
    return prod;
    
  }
}


//----
 var data = { sum: 
   { '[4,5,6]': { inp: [ 4, 5, 6 ], out: 15 },
     one: { inp: [ 3 ], out: 3 } } };
if (module) {
 module.exports.data = data;
}