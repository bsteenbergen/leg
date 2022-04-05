import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

const simplePrint = `
print 14`
const simplePrintExpected = `   1 | Program statements=[#2]
   2 | PrintStatement argument=(Int,"14")`

const printVar = `
str x = "hi" @ var decl
print x @ print statement
`
const printVarExpected = `   1 | Program statements=[#2,#4]
   2 | VariableDeclaration type=#3 name=(Id,"x") initializer=(Str,""hi"")
   3 | TypeName typeName=(Sym,"str")
   4 | PrintStatement argument=(Id,"x")`
// console.log(util.format(ast(printVar)))

describe("The AST generator produces a correct AST for ", () => {
  it("print statements", () => {
    assert.deepStrictEqual(util.format(ast(simplePrint)), simplePrintExpected)
  }),
    it("variable declarations", () => {
      assert.deepStrictEqual(util.format(ast(printVar)), printVarExpected)
    })
  // it("produces a correct AST with maps", () => {
  //   assert.deepStrictEqual(util.format(ast(mapSrc)), mapExpected)
  // })
})
