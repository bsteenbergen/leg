import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

const simplePrint = `
mumble 14`
const simplePrintExpected = `   1 | Program statements=[#2]
   2 | PrintStatement argument=(Int,"14")`

const vars = `
  int x = 5
  x = x + 1
`
const varsExpected = `   1 | Program statements=[#2,#4]
   2 | VariableDeclaration type=#3 name=(Id,"x") initializer=(Int,"5")
   3 | TypeName typeName=(Sym,"int")
   4 | VariableDeclaration type=(Id,"x") name=#5 initializer=undefined
   5 | BinaryExpression left=(Id,"x") op='+' right=(Int,"1")`

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

const cmp = `
cmp var_1 var_2`
const cmpExpected = `   1 | Program statements=[#2]
   2 | CompareInstruction args=[(Id,"var_1"),(Id,"var_2")]`

const math = `
  int a = 3
  int c = 4
  a - c 
  2 + 4
  int a = 3 % 4
`

const mathExpected = `   1 | Program statements=[#2,#4,#6,#7,#8]
   2 | VariableDeclaration type=#3 name=(Id,"a") initializer=(Int,"3")
   3 | TypeName typeName=(Sym,"int")
   4 | VariableDeclaration type=#5 name=(Id,"c") initializer=(Int,"4")
   5 | TypeName typeName=(Sym,"int")
   6 | BinaryExpression left=(Id,"a") op='-' right=(Id,"c")
   7 | BinaryExpression left=(Int,"2") op='+' right=(Int,"4")
   8 | VariableDeclaration type=#9 name=(Id,"a") initializer=#10
   9 | TypeName typeName=(Sym,"int")
  10 | BinaryExpression left=(Int,"3") op='%' right=(Int,"4")`

// console.log(util.format(ast(vars)))

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
    }),
    it("compare instruction", () => {
      assert.deepStrictEqual(util.format(ast(cmp)), cmpExpected)
    }),
    it("binary operations", () => {
      assert.deepStrictEqual(util.format(ast(math)), mathExpected)
    }),
    it("variable declaration and reassignment", () => {
      assert.deepStrictEqual(util.format(ast(vars)), varsExpected)
    })
  // it("produces a correct AST with maps", () => {
  //   assert.deepStrictEqual(util.format(ast(mapSrc)), mapExpected)
  // })
})
