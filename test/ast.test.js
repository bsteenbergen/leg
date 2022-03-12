import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

// TODO: This test case needs a lot more work
const source = `
num x = 2
mumble("hi there!")
task cube(num y) yields int^3
if z >= 0 yield z 
end
`
const expected = ` 
1 | Program statements = [#2, #3, #4, #7, #8]
2 | VariableDeclaration modifier=(Sym, "num") variable=(Id, "x") initializer = (Int, "2")
3 | PrintStatement argument=(Str, "hi there!")
4 | FunctionDeclaration funName=(Id, "cube") params=[#5] returnExp = [#6]
5 | Param name=(Id, "y"), paramCount=(Int, "1")
6 | BinaryExpression Op=(Sym, "^") left=(Id, "int") right=(Int, "3") 
7 | IfShort tests= consequent = [#8] 
8 | Loop 
`

describe("The AST generator", () => {
    it("produces a correct AST", () => {
        assert.deepStrictEqual(util.format(ast(source)), expected)
    })
})
