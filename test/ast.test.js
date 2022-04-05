import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

const simplePrint = `
mumble 14`
const simplePrintExpected = `   1 | Program statements=[#2]
   2 | PrintStatement argument=(Int,"14")`

const printVar = `
str x = "hi" @ var decl
mumble x @ print statement
`
const printVarExpected = `   1 | Program statements=[#2,#4]
   2 | VariableDeclaration type=#3 name=(Id,"x") initializer=(Str,""hi"")
   3 | TypeName typeName=(Sym,"str")
   4 | PrintStatement argument=(Id,"x")`

const funcDecl = `
#my_func:
  mumble str_1
#`

const funcDeclExpected = `   1 | Program statements=[#2]
   2 | FunctionDeclaration funcName=(Id,"#my_func") suite=#3
   3 | Suite statements=[#4]
   4 | PrintStatement argument=(Id,"str_1")`

const funCalls = `
@ function calls 
bl #set_values
b #print_values`

const funCallExpected = `   1 | Program statements=[#2,#3]
   2 | FunctionCall link=(Sym,"bl") funcName=(Id,"#set_values")
   3 | FunctionCall link=(Sym,"b") funcName=(Id,"#print_values")`

// console.log(util.format(ast(funcDecl)))

describe("The AST generator produces a correct AST for ", () => {
  it("print statements", () => {
    assert.deepStrictEqual(util.format(ast(simplePrint)), simplePrintExpected)
  }),
    it("variable declarations", () => {
      assert.deepStrictEqual(util.format(ast(printVar)), printVarExpected)
    }),
    it("function declarations", () => {
      assert.deepStrictEqual(util.format(ast(funcDecl)), funcDeclExpected)
    }),
    it("function calls", () => {
      assert.deepStrictEqual(util.format(ast(funCalls)), funCallExpected)
    })
  // it("produces a correct AST with maps", () => {
  //   assert.deepStrictEqual(util.format(ast(mapSrc)), mapExpected)
  // })
})
