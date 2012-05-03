# Testmaker


Uses an augmented nodejs repl to help explore code and make tests that can then be run in a test framework.

## Basic Usage

1. Clone repo or  (not yet: npm install testmaker ).
2. Run `node repl`
3. Load a file:  `load('first')`  This will load the suites (functions) to run the tests and then run any stored tests.
4. Run a test: `r[suitename]('testname', arg1, arg2, ...)`.  The suitename points to a function's name from the suites. It creates and runs a test called 'testname' and feeds the other arguments into the suite function.
5. Store a test:  `store()`  will store the last test run; pass in a number to store other tests. `stall()` stores all tests. Potentially dangerous.
6. The above does not save to disk. To do so, issue the `save()` command. The first argument can be a filename to save it to

## Example


## File Structure

## REPL Commands

* `load(file)`  Give the filename and it will be loaded and any tests in it will be run. 
* `list()` will list all the tests that have not passed. They may disagree with existing tests (status: false), there may be no test (status: new), 


c.list = function (pos, options) {

//store an output into data
c.store = function (pos) {
  if (typeof pos === "undefined") {
    pos = gl.names.length-1;
  }
  var s = gl.names[pos][0];
  var t = gl.names[pos][1];
  gl.data[s][t] = [gl.inp[s][t], gl.out[s][t]];  
  gl.names[pos][2] = true; //change status
  return pos + " stored";
};

//store all--unwise to use
c.stall = function () {
  var s, t, i, n;
  n = gl.names.length;
  for (i = 0; i < n; i += 1){
    c.store(i);
  }
  return "all tests stored, not saved";
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