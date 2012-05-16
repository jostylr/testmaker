# Testmaker


Uses an augmented nodejs repl to help explore code and make tests that can then be run in a test framework.

## Basic Usage

1. Clone repo or  (not yet: npm install testmaker ).
2. Run `node repl`
3. Load a file:  `load('first')`  This will load the suites (functions) to run the tests and then run any stored tests. Alternatively add a filename on the command line after repl. 
4. Run a test: `r[suitename]('testname', arg1, arg2, ...)`.  The suitename points to a function's name from the suites. It creates and runs a test called 'testname' and feeds the other arguments into the suite function. Alternatively, use  `t[suitename](arg1, arg2, ...)` and the args will be used to make the msg. 
5. Store a test:  `store()`  will store the last test run; pass in a number to store other tests. `stall()` stores all tests. Potentially dangerous.
6. The above does not save to disk. To do so, issue the `save()` command. The first argument can be a filename to save it to if different than the original. One can also version it with a second argument (pass falsy such as 0 if same file name desired). A different filename generates a mocha test file under the new name, but the version does not--it will be the original filename and overwrite whatever mocha test file was there. 
Alternatively, use `s()` to store and save.
7. Create a new suite by using  `q("new suitename", function_to_call)`. I often use the same function so I might do something like `q('arith', q.add)` where q.add is the function I want to use. Once run, then one can use r or t, such as `t.arith('(* (+ 3 4) 5)')`.


## Example

See first.js in the pretests folder. 

    >load('runT')
    0
    >t.arith('* (+ 3 4) 5)')
    [ 'new',
      49,
      [ 'error',
        'SyntaxError: "\'","(",";;","\\"",[ \\t\\r\\n],[0-9a-zA-Z_?!+=<>@#$%^&*\\/.\\-],number' ] ]
    >t.arith('(* (+ 3 4) 5)')
    [ 'new', 50, 35 ]
    >s()
    'saved and stored'
    >t.arith('(if (< 4 3) 1 0)')
    [ 'new', 51, 0 ]
    >list()
    [ [ '49. arith/* (+ 3 4) 5)',
        { status: 'new',
          input: [ '* (+ 3 4) 5)' ],
          output: 
           [ 'error',
             'SyntaxError: "\'","(",";;","\\"",[ \\t\\r\\n],[0-9a-zA-Z_?!+=<>@#$%^&*\\/.\\-],number' ],
          data: undefined } ],
      [ '51. arith/(if (< 4 3) 1 0)',
        { status: 'new',
          input: [ '(if (< 4 3) 1 0)' ],
          output: 0,
          data: undefined } ] ]

This gives a test of how it goes. If you need to modify the original files, just use reload() to load them up again. Any existing unsaved data gets erased, but the up arrow in the REPL recalls the last statements. 



## File Structure

## REPL Commands

* `load(file)`  Give the filename and it will be loaded and any tests in it will be run. 
* `list()` will show first not true item. Use 'z' to show last not true item. It can do more.
* `store()` number for storing or last one
* `stall()`
* `save(file, version)` no args will lead to saving of last loaded file
* `s()` stores and saves the first not true item. use 'z' to show last not true item.
* `reload()` will reload last file
* `runTest(f, input, testname)` The r[f] is an alias to this. If no testname, input string is used.
* `runTests(suites)` will run all the tests in suites object or current data.
* `r[suite](msg, arg1, arg2, ..)` creates a test case with msg as label and uses the arg1, arg2, .. 
* `t[suite](arg1, ...)` uses the arguments as an identifier. 

## TODO

async testing

Implement isEqual to 1) allow for numerical fuzziness and printing (and treating -0 and +0 as same) 2) reporting differences between the objects. 

creating the suite functions in repl and creating files. need a new command, record command.

figure out browser testing. should be trivial. 

Has Filename already thought not in an extensible way. command line arguments:  various options such as default dir, depth, file to load initially, array of files to cycle through. 

example with jquery and jsdom to generate browser interaction tests.

## License MIT