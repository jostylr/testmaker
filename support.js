/*globals module, require, console, exports, process*/


var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var jsb = require('prettyweb').js; 

//shared global between here and repl
// depth controls inspect level, version controls whether to version the save files
var gl = {depth : null, version: false, dir : '/pretest/', testdir : '/test/'
  , jsb : {'indent_size' : 2, indent_char : ' ', 'preserve_newlines'  : true, 'preserve_max_newlines' : 3
          , 'jslint_happy' : true, 'brace_style' : "end-expand", 'space_before_conditional': true  }
  , history : [], names : {}, inp: {}, out : {}, data : {}, errors : [], count:0
};

var testWrap; 


var r = {};
var t = {};

//q adds suite. if suite is an array, then each is associated with f
var q = function (suite, f) {
  var suites, i, n;
  if (_.isArray(suite)) {
    suites = suite;
    n = suites.length;
  } else {
    suites = [suite];
    n = 1;
  }
  for (i = 0; i < n; i += 1) {
    suite = suites[i];
    f.suite = suite;
    q[suite] = f;
    r[suite] = testWrap(suite);
    t[suite] = function () {
      var args = Array.prototype.slice.call(arguments);
      var str = args.toString();
      args.unshift(str);
      return r[suite].apply(null, args);
    };
  }
  return "Suite" + (n === 1 ? " " : "s ")  + suites.join(",") + " added.";
};

var c = {};

c.gl = gl;
c.r = r;
c.q = q;
c.t = t;

c.itemRenderer = function (pos, options) {

  var s, t, ret, i, n
    , names = gl.names
    ;
  options = options || "s";

  if (pos < 0) {
    pos = gl.names.length + pos;
  }

  s = names[pos][0];
  t = names[pos][1];
  //string iod to add input, output, data. all optional. default iod
  ret = {};  
  n = options.length;
  for (i = 0; i < n; i += 1) {
    switch (options[i]) {
      case "i" : ret.input = gl.inp[s][t];
      break;
      case "o" : ret.output = gl.out[s][t];
      break;
      case "d" : ret.data = gl.data[s][t];
      break;
      case "s" : ret.status = names[pos][2];
      break;
      default : gl.errors.push("unknown option in list: " + options[i]);
    }
  }
  return [pos + ". " + s + "/" + t, ret ];
  
};

c.itemFilter = function (filter) {
  
  var i, n
    , action = {}
    , names = gl.names
    , ret = []
    ;
    
    
  filter = filter || "!t";
  
  if (filter[0] === "!" ) {
    //not the rest
    filter =_.difference('ftne'.split(''), filter.split(''));
  }
  n = filter.length;
  for (i = 0; i < n; i += 1) {
    switch (filter[i]) {
      case "f" : action[false] = 1;
      break;
      case "t" : action[true] = 1;
      break;
      case "n" : action["new"] = 1;
      break;
      case "e" : action["error"] = 1;
      break;
    }
  }
  n = names.length;
  for (i = 0; i < n; i += 1) {
    if (action.hasOwnProperty(names[i][2])) {
      ret.push(i);
    }
  }
  return ret;
};

//lists all outputs name and status or the output of the numbered one.
c.list = function (pos, options) {
  var ret, i, n, filter;
  if (pos === "z") {
    filter = c.itemFilter('!t');
    if (filter.length > 0) {
      return c.itemRenderer(filter[filter.length -1], options || 'siod');          
    } else {
      return "all good";
    }
  }
  if (pos === "a") {
    filter = c.itemFilter('!t');
    if (filter.length > 0) {
      return c.itemRenderer(filter[0], options || 'siod');          
    } else {
      return "all good";
    }
  }
  
  if (_.isNumber(pos)) {
    //siod for options means  status, input, output, data
    return c.itemRenderer(pos, options || 'siod');
  } else { //pos becomes a filter string (ftne: false, true, new, error), options is again a string of return
    filter = c.itemFilter(pos || '!t');
    ret = [];
    n = filter.length;
    for (i = 0; i < n; i += 1) {
      ret.push(c.itemRenderer(filter[i], options || 'siod'));
    }
    return ret;
  }
  
};

c.all = function () {
  return c.list('!');
}

//store an output into data
c.store = function (pos) {
  if (typeof pos === "undefined") {
    filter = c.itemFilter('!t');
    if (filter.length > 0) {
     pos = filter[filter.length -1];
    } else {
     pos = gl.names.length - 1;
    }
  }
  var s = gl.names[pos][0];
  var t = gl.names[pos][1];
  if (! gl.data.hasOwnProperty(s) ) {
    gl.data[s] = {};
  }
  gl.data[s][t] = {inp: gl.inp[s][t], out : gl.out[s][t]};  
  gl.names[pos][2] = true; //change status
  return pos + " stored";
};

//store all--unwise to use
c.stall = function () {
  var  i, n;
  n = gl.names.length;
  for (i = 0; i < n; i += 1){
    c.store(i);
  }
  return "all tests stored, not saved";
};

var writeFunctions = function () {
  var suite;
  var ret = [];
  for (suite in q) {
    ret.push("'" + suite + "'" + ' : ' + q[suite].toString() );
  }
  ret = 'suites = {\n  ' + ret.join('\n  ,  ') + '\n};\n\n';
  return ret;
};

var writeTests = function () {
  var suite, test, cur
    , ret = '_ = require("underscore");\n\n'
          + 'util = require("util"); \n\n'
    ;
    
  for (suite in gl.data) {
    ret += 'suite("'+ suite + '");\n\n';
    for (test in gl.data[suite]) {
      cur = gl.data[suite][test];
      ret += 'test("' + test + '", function () {\n ';
      if (cur.out[0] === 'error') {
        ret += 'var flag = true; try {\n  suites.' + suite + '.apply(null, ' 
            + util.inspect(cur.inp, false, null) + '); \n'
            + '} catch (e) {\n'
            + '  flag = false;\n'
            + '  if (! _.isEqual(e.toString(), "' + cur.out[1] + '") ) {\n'
            + '    throw new Error ("wrong error", e);\n'
            + '  }\n'
            + '}\n'
            + 'if (flag) {\n'
            + '  throw new Error ("failed to throw error");'
            + '}'
            ;
      } else {
        ret += 'var result = suites.' + suite + '.apply(null, ' 
            + util.inspect(cur.inp, false, null) + ');\n '
            + 'var pass = _.isEqual(result, ' + util.inspect(cur.out, false, null) + ' ); \n'
            + 'if (!pass) {\n'
            + "  throw new Error (util.inspect(result) + \" not equal to \" + \"" + util.inspect(cur.out, false, null).replace(/\n/g, "\\n") + "\" + \"\\n     Input:  "
            + util.inspect(cur.inp, false, null).replace(/\s/g, "") + "\"  );\n"
            + '}\n';
      }
      ret += '}); \n\n';
    }
  }
  
  return ret;
};


//save current data state to file
c.save = function (fname, version) {
  var cwd = process.cwd();
  var testname = cwd + gl.testdir + (fname || gl.file) + '.js';
  fname = cwd + gl.dir + (fname || gl.file);
  version = version || gl.version;
  try {
    if (version === true) {
      fs.rename(fname+'.js', fname+'_'+Date.now()+'.js');
    } else if (version) {
      fs.rename(fname+'.js', fname+'_'+version+'.js');
    }
    // write in pretest
    fs.writeFileSync(fname + '.js', jsb(gl.text + '//----\n' + 'module.exports.' + writeFunctions()
      + '\nvar data = ' + util.inspect(gl.data, false, null) + ';\n'
      + '\n\nmodule.exports.data = data;', gl.jsb)
      , 'utf8'
    );
    // write out tests
    fs.writeFileSync(testname, jsb ( gl.text + 'var ' + writeFunctions() + writeTests() , gl.jsb) );
    
    return "successfully saved";
   } catch (e) {
     return ["failed to save", e];
   }
   
};

c.s = function (pos, fname, version) {
  c.store(pos);
  c.save(fname, version);
  return "saved and stored";
};

//empties an object. needed for sharing
c.empty = function (obj) {
  var key;
  for (key in obj) {
    delete obj[key];
  }
};

// r.sum('two', 3, 4)
// almost call the function, but message name and then arguments
testWrap = function (suite) {
  return function () {
    return c.runTest(q[suite], Array.prototype.slice.call(arguments, 1), arguments[0], suite);
  };
};

var clearCache = function (base) {
  var key, term
    , search = [base]
    , cache = require.cache
  ;
  
  delete require.cache[base];
  while (search.length > 0) {
    term = search.pop();
    for (key in cache) {
      if (cache[key].parent.id === term ) {
        search.push(key);
        delete require.cache[key];
      }
    }    
  }
  
};

// load a file, run tests, report results
c.load = function (fname) {
  var suites, suite;
  
  var cwd = process.cwd();
  
  //push history: 
  if (gl.file) {
    gl.history.push({
      file :  gl.file
      , names : gl.names
      , inp : gl.inp
      , out : gl.out
      , data : gl.data
      , errors : gl.errors
      , count : gl.count
    });
  }  
  // initialize new stuff
  gl.file = fname;
  gl.names =  [];
  gl.inp = {};
  gl.out = {};
  gl.data = {};
  gl.errors = [];
  gl.count = 0;
  
   
   //clear r
   c.empty(r);
   c.empty(q);
   c.empty(t);
   
   
   // load file
   try {
     gl.text = fs.readFileSync(cwd + gl.dir+fname+'.js', 'utf8').split('//----')[0];
     clearCache(require.resolve(cwd + gl.dir+fname+'.js') );
     gl.current = require(cwd + gl.dir+fname+'.js');
   } catch (e) {
     gl.errors.push(["failed to load file: ", e]);
     return "failed to load file: " + e;
   }
   
   if (gl.current.hasOwnProperty("data")) {
     gl.data = gl.current.data;
   } 
   
   suites = gl.current.suites;
   for (suite in suites) {
     q(suite, suites[suite]);
//     s[suite] = suites[suite];
//     r[suite] = c.testWrap(suites[suite], suite);
   }
   
   
   return c.runTests(gl.data);
};

c.reload = function () {
  return c.load(gl.file);
};

c.initObj = function (suite) {
  if (!gl.data.hasOwnProperty(suite)) {
    gl.data[suite] = {};
  }
  if (!gl.inp.hasOwnProperty(suite)) {
    gl.inp[suite] = {};
  }
  if (!gl.out.hasOwnProperty(suite)) {
    gl.out[suite] = {};
  }
  
};


// the real basic run example
c.runTest = function (f, input, testname, suite) {
  var result, pass, err;
  if (!input) {
    input = f; 
    f = gl.defaultF;
  } 
  if (_.isString(f)) {
    f = gl.current.suites[f] || gl.defaultF;
  }
  if (! _.isFunction(f)) {
    throw new Error(["no f specified, no default either", f, input, testname]);
  }
  testname = testname || JSON.stringify(input);
  suite = suite || f.suite;
  
  c.initObj(suite);
  gl.inp[suite][testname] = input;
  
  
  // this should be dealt within the function f calling the real target
    if (_.isArray(input)) {     
      try {
        gl.out[suite][testname] = result = f.apply(null, input);
      } catch (e) {
        gl.out[suite][testname] = result = ["error", e.toString()];
        err = true;
      }  
      if (gl.data[suite][testname]) {
        pass = _.isEqual(result, gl.data[suite][testname].out);
        if (pass) {
          gl.names.push([suite, testname, true]);
          return [true, gl.names.length-1];
        } else {
          gl.count += 1;
          gl.names.push([suite, testname, (err) ? "error" : false ]);
          return [(err) ? "error" : false , gl.names.length-1, result];
        }
      } else {
        gl.names.push([suite, testname, "new"]);
        gl.count += 1;
        return ["new", gl.names.length-1, result];
      }
    } else {
      gl.errors.push(["expecting input to be array", suite, testname, input]);
      return "expecting input to be array";
    }    
};


c.runTests = function (data) { //data object here  or array of keys
  var suite, tests, test,  arr, i, n;
  gl.count = 0; //reset count to 0 of failed tests
  if (_.isArray(data)) {
    arr = data;
    data = {};
    n = arr.length;
    for (i = 0; i < n; i += 1) {
      data[arr[i]] = gl.data[arr[i]];
    }
  }
  for (suite in data) {
    if (r.hasOwnProperty(suite)) {
      tests = data[suite];
      for (test in tests) {
        r[suite].apply(null, [test].concat(tests[test].inp) );
      }
    } else {
      gl.errors.push(["no function for ", suite]);
    }
  }
  
  return gl.count; 
};


module.exports = c;