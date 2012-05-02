/*globals module, require, console, exports, process*/


var _ = require('underscore');
var fs = require('fs');
var util = require('util');


//shared global between here and repl
// depth controls inspect level, version controls whether to version the save files
var gl = {depth : null, version: false, dir : './tests/'
  , history : [], names : {}, inp: {}, out : {}, data : {}, errors : [], count:0
};

var r = {};

var c = {};

c.gl = gl;
c.r = r;

c.itemRenderer = function (pos, options) {

  var s, t, ret, i, n
    , names = gl.names
    ;
  options = options || "s";

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
};

//lists all outputs name and status or the output of the numbered one.
c.list = function (pos, options) {
  var ret, i, n, filter;
  if (_.isNumber(pos)) {
    //siod for options means  status, input, output, data
    return c.itemRenderer(pos, options || 'sio');
  } else { //pos becomes a filter string (ftne: false, true, new, error), options is again a string of return
    filter = c.itemFilter(pos || '!t');
    ret = [];
    n = filter.length;
    for (i = 0; i < n; i += 1) {
      ret.push(c.itemRenderer(filter[i], options || 's'));
    }
    return ret;
  }
  
};


//store an output into data
c.store = function (pos) {
  var s = gl.names[pos][0];
  var t = gl.names[pos][1];
  gl.data[s][t] = [gl.inp[s][t], gl.out[s][t]];  
};

//store all--unwise to use
c.stall = function () {
  var s, t, i, n;
  n = gl.names.length;
  for (i = 0; i < n; i += 1){
    s = gl.names[i][0];
    t = gl.names[i][1];
    gl.data[s][t] = {inp: gl.inp[s][t], out: gl.out[s][t]};  
  }
  return "data stored";
};

//save current data state to file
c.save = function (fname, version) {
  fname = gl.dir + (fname || gl.file);
  version = version || gl.version;
  try {
    if (version === true) {
      fs.rename(fname+'.js', fname+'_'+Date.now()+'.js');
    } else if (version) {
      fs.rename(fname+'.js', fname+'_'+version+'.js');
    }
    fs.writeFileSync(fname + '.js', gl.text.replace(/\/\/\-\-\-\-[\s\S]*/
      , '//----\n var data = ' + util.inspect(gl.data, false, null) + ';\n'
      + 'if (module) {\n module.exports.data = data;\n}'
      , 'utf8'
    ));
    return "successfully saved";
   } catch (e) {
     return ["failed to save", e];
   }
   
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
c.testWrap = function (f) {
  return function () {
    return c.runTest(f, Array.prototype.slice.call(arguments, 1), arguments[0]);
  }
}

// load a file, run tests, report results
c.load = function (fname) {
  var suites, suite;
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
   
   // load file
   try {
     gl.text = fs.readFileSync(gl.dir+fname+'.js', 'utf8');
     delete require.cache[require.resolve(gl.dir+fname+'.js')];
     gl.current = require(gl.dir+fname+'.js');
   } catch (e) {
     gl.errors.push(["failed to load file: ", e]);
     return "failed to load file: " + e;
   }
   
   if (gl.current.hasOwnProperty("data")) {
     gl.data = gl.current.data;
   } 
   
   suites = gl.current.suites;
   for (suite in suites) {
     //each suite is a function, store the suite name in the function for use in run
     suites[suite].suite = suite;
     r[suite] = c.testWrap(suites[suite]);
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
  
}


// the real basic run example
c.runTest = function (f, input, testname) {
  var suite, result, pass, err;
  if (!input) {
    input = f; 
    f = gl.defaultF;
  } 
  if (_.isString(f)) {
    f = gl.current.suites[f] || gl.defaultF;
  }
  if (! _.isFunction(f)) {
    throw new Error("no f specified, no default either");
  }
  testname = testname || JSON.stringify(input);
  suite = f.suite;
  
  c.initObj(suite);
  gl.inp[suite][testname] = input;
  
  
  // this should be dealt within the function f calling the real target
    if (_.isArray(input)) {     
      try {
        gl.out[suite][testname] = result = f.apply(null, input);
      } catch (e) {
        gl.out[suite][testname] = result = ["error", e];
        err = flag;
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


c.runTests = function (suites) { //data object here
  var suite, tests, test, f;
  gl.count = 0; //reset count to 0 of failed tests
  for (suite in suites) {
    if (gl.current.suites.hasOwnProperty(suite)) {
      f = gl.current.suites[suite];
      tests = suites[suite];
      for (test in tests) {
        c.runTest(f, tests[test].inp, test);
      }
    } else {
      gl.errors.push(["no function for ", suite]);
    }
  }
  
  return gl.count; 
};


module.exports = c;