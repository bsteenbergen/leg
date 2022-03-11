import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

// TODO: This test case needs a lot more work
const source = `
num x = 2
mumble("hi there!")
task cube(y) yields int^3
if z >= 0: 
    yield z 
else: 
    yield -z
`
const expected = ` 
1 | Program statements = [#2, #3, #4, #7, #8]
2 | VariableDeclaration modifier=(Sym, "num") variable=(Id, "x") initializer = (Int, "2")
3 | PrintStatement argument=(Str, "hi there!")
4 | FunctionDeclaration funName=(Id, "cube") params=[#5] returnExp = [#6]
5 | Param name=(Id, "y"), paramCount=(Int, "1"), readOnly = ??????
6 | 
7 | IfLong tests = ???? consequent = [#8] alternate = [#9]
8 | Loop 
`

describe("The AST generator", () => {
    it("produces a correct AST", () => {
        assert.deepStrictEqual(util.format(ast(source)), expected)
    })
})
