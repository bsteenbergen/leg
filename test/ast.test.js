import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

const prt = `
  prt 14
  prt 10001111
  decl str x "hi" @ var decl
  prt x @ print statement`
const prtExp = `   1 | Program statements=[#2,#3,#4,#6]
   2 | PrintStatement argument=(Int,"14")
   3 | PrintStatement argument=(Int,"10001111")
   4 | VariableDeclaration type=#5 name=(Id,"x") initializer=(Str,""hi"")
   5 | TypeName typeName=(Sym,"str")
   6 | PrintStatement argument=(Id,"x")`

const varDeclAndAsgn = `
  decl bin b1 00110101b
  asgn b1 10101111b
  decl [int] collection []
  asgn collection [1, "b", true]`
const varDeclAndAsgnExp = `   1 | Program statements=[#2,#4,#5,#10]
   2 | VariableDeclaration type=#3 name=(Id,"b1") initializer=(Bin,"00110101b")
   3 | TypeName typeName=(Sym,"bin")
   4 | VariableAssignment name=(Id,"b1") initializer=(Bin,"10101111b")
   5 | VariableDeclaration type=#6 name=(Id,"collection") initializer=#9
   6 | TypeName typeName=#7
   7 | ArrayType baseType=#8
   8 | TypeName typeName=(Sym,"int")
   9 | LegArray contents=[]
  10 | VariableAssignment name=(Id,"collection") initializer=#11
  11 | LegArray contents=[(Int,"1"),(Str,""b""),(Bool,"true")]`

const funcDecl = `
#my_func:
  prt str_1
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
   2 | FunctionCall link=(Sym,"bl") funcName=(Id,"#set_values") condition=[]
   3 | FunctionCall link=(Sym,"b") funcName=(Id,"#print_values") condition=[]`

const cmp = `
cmp var_1 var_2`
const cmpExpected = `   1 | Program statements=[#2]
   2 | CompareInstruction args=[(Id,"var_1"),(Id,"var_2")]`

const math = `
  decl int a 3
  decl int c 4
  prt a - c 
  prt 2 + 4
  decl int bb 3 % 4`
const mathExpected = `   1 | Program statements=[#2,#4,#6,#8,#10]
   2 | VariableDeclaration type=#3 name=(Id,"a") initializer=(Int,"3")
   3 | TypeName typeName=(Sym,"int")
   4 | VariableDeclaration type=#5 name=(Id,"c") initializer=(Int,"4")
   5 | TypeName typeName=(Sym,"int")
   6 | PrintStatement argument=#7
   7 | BinaryExpression left=(Id,"a") op='-' right=(Id,"c")
   8 | PrintStatement argument=#9
   9 | BinaryExpression left=(Int,"2") op='+' right=(Int,"4")
  10 | VariableDeclaration type=#11 name=(Id,"bb") initializer=#12
  11 | TypeName typeName=(Sym,"int")
  12 | BinaryExpression left=(Int,"3") op='%' right=(Int,"4")`

const ifAndLoop = `
#loop:
  prt x
  #if x > 5 :
    asgn x x + 1
  #
  b #loop x < 10 @ loop only if x < 10
#`
const ifAndLoopExp = `   1 | Program statements=[#2]
   2 | FunctionDeclaration funcName=(Id,"#loop") suite=#3
   3 | Suite statements=[#4,#5,#10]
   4 | PrintStatement argument=(Id,"x")
   5 | IfStatement condition=#6 suite=#7 elseSuite=[]
   6 | BinaryExpression left=(Id,"x") op='>' right=(Int,"5")
   7 | Suite statements=[#8]
   8 | VariableAssignment name=(Id,"x") initializer=#9
   9 | BinaryExpression left=(Id,"x") op='+' right=(Int,"1")
  10 | FunctionCall link=(Sym,"b") funcName=(Id,"#loop") condition=[#11]
  11 | BinaryExpression left=(Id,"x") op='<' right=(Int,"10")`

const complexRelop = `asgn x c < d < e`
const complexRelopExpected = `   1 | Program statements=[#2]
   2 | VariableAssignment name=(Id,"x") initializer=#3
   3 | BinaryExpression left=#4 op='<' right=(Id,"e")
   4 | BinaryExpression left=(Id,"c") op='<' right=(Id,"d")`

const instructions = `
  add sent "hi" " and bye"
  sub r10 1001b 1100b
  cmp result f1 f2`
const instructionsExp = `   1 | Program statements=[#2,#3,#4]
   2 | AddInstruction args=[(Id,"sent"),(Str,""hi""),(Str,"" and bye"")]
   3 | SubInstruction args=[(Id,"r10"),(Bin,"1001b"),(Bin,"1100b")]
   4 | CompareInstruction args=[(Id,"result"),(Id,"f1"),(Id,"f2")]`

const miscTests = `decl bool x 1 > -1 || false
decl bool y "a" == "b" && 10 <= 9
prt !x
prt 9 * 10
prt -3.4 ^ 2
prt 1238.129308 % 2.1`
const miscTestsExpected = `   1 | Program statements=[#2,#6,#11,#13,#15,#17]
   2 | VariableDeclaration type=#3 name=(Id,"x") initializer=#4
   3 | TypeName typeName=(Sym,"bool")
   4 | BinaryExpression left=#5 op='||' right=(Bool,"false")
   5 | BinaryExpression left=(Int,"1") op='>' right=(Int,"-1")
   6 | VariableDeclaration type=#7 name=(Id,"y") initializer=#8
   7 | TypeName typeName=(Sym,"bool")
   8 | BinaryExpression left=#9 op='&&' right=#10
   9 | BinaryExpression left=(Str,""a"") op='==' right=(Str,""b"")
  10 | BinaryExpression left=(Int,"10") op='<=' right=(Int,"9")
  11 | PrintStatement argument=#12
  12 | UnaryExpression op='!' operand=(Id,"x")
  13 | PrintStatement argument=#14
  14 | BinaryExpression left=(Int,"9") op='*' right=(Int,"10")
  15 | PrintStatement argument=#16
  16 | BinaryExpression left=(Float,"-3.4") op='^' right=(Int,"2")
  17 | PrintStatement argument=#18
  18 | BinaryExpression left=(Float,"1238.129308") op='%' right=(Float,"2.1")`

// console.log(util.format(ast(miscTests)))

describe("The AST generator produces a correct AST for ", () => {
  it("print statements", () => {
    assert.deepStrictEqual(util.format(ast(prt)), prtExp)
  }),
    it("variable declarations and reassignments", () => {
      assert.deepStrictEqual(util.format(ast(varDeclAndAsgn)), varDeclAndAsgnExp)
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
    it("if statements and while loops", () => {
      assert.deepStrictEqual(util.format(ast(ifAndLoop)), ifAndLoopExp)
    }),
    it("initialize variable as result of complex/nested relop", () => {
      assert.deepStrictEqual(util.format(ast(complexRelop)), complexRelopExpected)
    }),
    it("instructions", () => {
      assert.deepStrictEqual(util.format(ast(instructions)), instructionsExp)
    }),
    it("misc tests", () => {
      assert.deepStrictEqual(util.format(ast(miscTests)), miscTestsExpected)
    })
})

describe("Rejects malformed programs:", () => {
  it("nonsense declaration", () => {
    assert.throws(() => ast(`decl 0 and 1`))
  })
})
