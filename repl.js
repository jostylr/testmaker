/*globals module, require, console, exports*/

var util = require('util');
var _ = require('underscore')
var c = require('./support');

var gl = c.gl;

//repl initialization
var repl = require('repl');
//overwrite default level of 2 with unlimited depth!
repl.writer = function (obj) {return util.inspect(obj, false, gl.depth, true);};
var rs = repl.start('>');  //{prompt:'>', writer : function (obj) {return util.inspect(obj, false, null, true);}});
//store things in c for easy access. mainly functions. data is probably best in gl object

_.extend(rs.context, c);

rs.context.l = function () {
  return c.load('first');
}