/*global suite, test*/ //comment for eslint

// This test uses TDD Mocha. see https://mochajs.org/ for help
// http://ricostacruz.com/cheatsheets/mocha-tdd

// The module 'assert' provides assertion methods from node
const assert = require("assert")

const printDir = require("./printDir")

suite("printDir Tests", () => {

    test("print", () => {
        let result = printDir.printDir("foo",0)
        assert.equal(result, "print(foo)")
    })

    test("printdir", () => {
        let result = printDir.printDir("foo.",0)
        assert.equal(result, "print(dir(foo))")
    })

})