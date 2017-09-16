/*global suite, test*/ //comment for eslint

// This test uses TDD Mocha. see https://mochajs.org/ for help
// http://ricostacruz.com/cheatsheets/mocha-tdd

// The module 'assert' provides assertion methods from node
const assert = require("assert")

const evals = require("./evaluators")

suite("PythonEvaluator Tests", () => {
    let pyEvaluator = new evals.PythonEvaluator()

    test("sanity check: 1+1=2", () => {
        assert.equal(1+1,2)
    })

    test("PythonEvaluator returns result", function(done){
        pyEvaluator.onResult = (result)=>{
            console.log(result)
            assert.notEqual(result, null)
            done()
        }
        pyEvaluator.execCode({evalCode:"x"})
    })

    test("PythonEvaluator returns error when bad code", function(done){
        pyEvaluator.onResult = (result)=>{ 
            assert.notEqual(result.ERROR, null)
            assert.notEqual(result.ERROR.trim(), "")
            done()
        }
        pyEvaluator.execCode({evalCode:"x"})
    })

    test("PythonEvaluator returns user variables", function(done){
        pyEvaluator.onResult = (result)=>{ 
            assert.equal(result.userVariables['x'], 1)
            done()
        }
        pyEvaluator.execCode({evalCode:"x=1"})
    })

})