/*globals module, require, console, exports*/

var _ = require('underscore');

//import stuff here
suites = {
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

_ = require("underscore");

util = require("util");

suite("sum");

test("0", function () {
  var result = suites.sum.apply(null, []);
  var pass = _.isEqual(result, 0);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "0" + "\n     Input:  []");
  }
});

test("[4,5,6]", function () {
  var result = suites.sum.apply(null, [4, 5, 6]);
  var pass = _.isEqual(result, 15);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "15" + "\n     Input:  [ 4, 5, 6 ]");
  }
});

test("one", function () {
  var result = suites.sum.apply(null, [3]);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  [ 3 ]");
  }
});

suite("mult");

test("0", function () {
  var result = suites.mult.apply(null, []);
  var pass = _.isEqual(result, 1);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "1" + "\n     Input:  []");
  }
});

test("two", function () {
  var result = suites.mult.apply(null, [3, 4]);
  var pass = _.isEqual(result, 12);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "12" + "\n     Input:  [ 3, 4 ]");
  }
});

test("three", function () {
  var result = suites.mult.apply(null, [3, 4, 7]);
  var pass = _.isEqual(result, 84);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "84" + "\n     Input:  [ 3, 4, 7 ]");
  }
});

test("one", function () {
  var result = suites.mult.apply(null, [2]);
  var pass = _.isEqual(result, 2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "2" + "\n     Input:  [ 2 ]");
  }
});

test("inf", function () {
  var result = suites.mult.apply(null, [Infinity]);
  var pass = _.isEqual(result, Infinity);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "Infinity" + "\n     Input:  [ Infinity ]");
  }
});

test("inf -inf", function () {
  var result = suites.mult.apply(null, [Infinity, -Infinity]);
  var pass = _.isEqual(result, -Infinity);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "-Infinity" + "\n     Input:  [ Infinity, -Infinity ]");
  }
});

test("inf -inf 0", function () {
  var result = suites.mult.apply(null, [Infinity, -Infinity, 0]);
  var pass = _.isEqual(result, NaN);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "NaN" + "\n     Input:  [ Infinity, -Infinity, 0 ]");
  }
});

test("bad args", function () {
  var flag = true;
  try {
    suites.mult.apply(null, ['4']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "Error: not a number")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

suite("scratch");

test("3", function () {
  var result = suites.scratch.apply(null, [3]);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  [ 3 ]");
  }
});

test("array", function () {
  var result = suites.scratch.apply(null, [
    [1, 3]
  ]);
  var pass = _.isEqual(result, [1, 3]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 1, 3 ]" + "\n     Input:  [ [ 1, 3 ] ]");
  }
});

suite("newf");

test("3 4", function () {
  var result = suites.newf.apply(null, [3, 4]);
  var pass = _.isEqual(result, 7);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "7" + "\n     Input:  [ 3, 4 ]");
  }
});