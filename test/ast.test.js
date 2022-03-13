import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

// TODO: This test case needs a lot more work
const source = `
mumble("hi there!")
num x = 2
task cube(num y) yields int^3
if z >= 0 yield z 
end
task combineStrings(str str1, str str2) yields combinedString:
	str combinedString = str1 + str2
end 
task greeting(str name) yields "hi" + name
`
const expected = `   1 | Program statements=[#2,#3,#4,#7,#10,#16]
   2 | PrintStatement argument=(Str,""hi there!"")
   3 | VariableDeclaration modifier='num' variable='x' initializer=(Int,"2")
   4 | FunctionDeclaration funName=(Id,"cube") params=[#5] returnExp=[#6] body=[]
   5 | Param name=(Sym,"num") type='y'
   6 | BinaryExpression left=(Id,"int") op='^' right=(Int,"3")
   7 | IfShort tests=#8 consequent=#9
   8 | BinaryExpression left=(Id,"z") op='>=' right=(Int,"0")
   9 | Suite statements=[(Id,"yield"),(Id,"z")]
  10 | FunctionDeclaration funName=(Id,"combineStrings") params=[#11,#12] returnExp=[(Id,"combinedString")] body=[#13]
  11 | Param name=(Sym,"str") type='str1'
  12 | Param name=(Sym,"str") type='str2'
  13 | Suite statements=[#14]
  14 | VariableDeclaration modifier='str' variable='combinedString' initializer=#15
  15 | BinaryExpression left=(Id,"str1") op='+' right=(Id,"str2")
  16 | FunctionDeclaration funName=(Id,"greeting") params=[#17] returnExp=[#18] body=[]
  17 | Param name=(Sym,"str") type='name'
  18 | BinaryExpression left=(Str,""hi"") op='+' right=(Id,"name")`
describe("The AST generator", () => {
  it("produces a correct AST", () => {
    assert.deepStrictEqual(util.format(ast(source)), expected)
  })
})
