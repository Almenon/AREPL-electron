/*global suite, test*/ //comment for eslint

// This test uses TDD Mocha. see https://mochajs.org/ for help
// http://ricostacruz.com/cheatsheets/mocha-tdd

// The module 'assert' provides assertion methods from node
const assert = require("assert")

const printDir = require("./printDir")

suite("printDir", () => {

    test("adds print on new line", () => {
        let currentLine = "foo"
        let result = printDir.printDir(currentLine,0)
        result = result.split('\n')

        assert.equal(result[0], currentLine)
        assert.equal(result[1], "print(foo)")
    })

    test("can handle expressions", () => {
        let currentLine = "x=1"
        let result = printDir.printDir(currentLine,0)
        result = result.split('\n')

        assert.equal(result[0], currentLine)
        assert.equal(result[1], "print(x)")
    })

    test("print keeps whitespace", () => {
        let currentLine = "  foo"
        let result = printDir.printDir(currentLine,0)
        result = result.split('\n')
        
        assert.equal(result[0], currentLine)
        assert.equal(result[1], "  print(  foo)")
    })

    test("adds print(dir()) on newLine when .", () => {
        let currentLine = "foo."
        let result = printDir.printDir(currentLine,0)
        result = result.split('\n')

        assert.equal(result[0], "foo")
        assert.equal(result[1], "print(dir(foo))")
    })

})
