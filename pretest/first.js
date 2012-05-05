/*globals module, require, console, exports*/

var _ = require('underscore');

//import stuff here
//----
module.exports.suites = {
  sum: function () {
    var i, sum = 0;
    for (i = arguments.length - 1; i > -1; i -= 1) {
      sum += arguments[i];
    }

    return sum;
  },
  mult: function () {
    var i, prod = 1;
    for (i = arguments.length - 1; i > -1; i -= 1) {
      if (!_.isNumber(arguments[i])) {
        throw new Error("not a number", i);
      }
      prod *= arguments[i];
    }

    return prod;

  },
  scratch: function (a) {
    return a;
  },
  newf: function (a, b) {
    return a + b;
  }
};


var data = {
  sum: {
    '0': {
      inp: [],
      out: 0
    },
    '[4,5,6]': {
      inp: [4, 5, 6],
      out: 15
    },
    one: {
      inp: [3],
      out: 3
    }
  },
  mult: {
    '0': {
      inp: [],
      out: 1
    },
    two: {
      inp: [3, 4],
      out: 12
    },
    three: {
      inp: [3, 4, 7],
      out: 84
    },
    one: {
      inp: [2],
      out: 2
    },
    inf: {
      inp: [Infinity],
      out: Infinity
    },
    'inf -inf': {
      inp: [Infinity, -Infinity],
      out: -Infinity
    },
    'inf -inf 0': {
      inp: [Infinity, -Infinity, 0],
      out: NaN
    },
    'bad args': {
      inp: ['4'],
      out: ['error', 'Error: not a number']
    }
  },
  scratch: {
    '3': {
      inp: [3],
      out: 3
    },
    array: {
      inp: [
        [1, 3]
      ],
      out: [1, 3]
    }
  },
  newf: {
    '3 4': {
      inp: [3, 4],
      out: 7
    }
  }
};


module.exports.data = data;