import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

// TODO: This test case needs a lot more work
const source = `
mumble("hi")
`
const expected = ` 
1 | Program statements = [#2, ]
2 | PrintStatement argument = 
`
describe("The AST generator", () => {
    it("produces a correct AST", () => {
      assert.deepStrictEqual(util.format(ast(source)), expected)
    })
  })