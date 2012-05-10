# Testmaker


Uses an augmented nodejs repl to help explore code and make tests that can then be run in a test framework.

## Basic Usage

1. Clone repo or  (not yet: npm install testmaker ).
2. Run `node repl`
3. Load a file:  `load('first')`  This will load the suites (functions) to run the tests and then run any stored tests.
4. Run a test: `r[suitename]('testname', arg1, arg2, ...)`.  The suitename points to a function's name from the suites. It creates and runs a test called 'testname' and feeds the other arguments into the suite function.
5. Store a test:  `store()`  will store the last test run; pass in a number to store other tests. `stall()` stores all tests. Potentially dangerous.
6. The above does not save to disk. To do so, issue the `save()` command. The first argument can be a filename to save it to if different than the original. One can also version it with a second argument (pass falsy such as 0 if same file name desired). A different filename generates a mocha test file under the new name, but the version does not--it will be the original filename and overwrite whatever mocha test file was there. 

## Example

See first.js in the pretests folder. 

## File Structure

## REPL Commands

* `load(file)`  Give the filename and it will be loaded and any tests in it will be run. 
* `list()` will list all the tests that have not passed. They may disagree with existing tests (status: false), there may be no test (status: new), 
* `store()` number for storing or last one
* `stall()`
* `save(file, version)` no args will lead to saving of last loaded file
* `s()` stores and saves the last one. 
* `reload()` will reload last file
* `runTest(f, input, testname)` The r[f] is an alias to this. If no testname, input string is used.
* `runTests(suites)` will run all the tests in suites object or current data.
* `r[suite](msg, arg1, arg2, ..)` creates a test case with msg as label and uses the arg1, arg2, .. 
* `t[suite](arg1, ...)` uses the arguments as an identifier. 

## TODO

async testing

creating the suite functions in repl and creating files. need a new command, record command.

figure out browser testing. should be trivial. 

Has Filename already thought not in an extensible way. command line arguments:  various options such as default dir, depth, file to load initially, array of files to cycle through. 

example with jquery and jsdom to generate browser interaction tests.

## License MIT