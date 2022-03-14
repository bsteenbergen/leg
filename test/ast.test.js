import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

// TODO: This test case needs a lot more work
const source = `
mumble("hi there!")
num x = 2
task cube(num y) yields int^3
cube(12)
if a >= 0  rem a / 2
end
task combineStrings(str str1, str str2) yields combinedString:
	str combinedString = str1 + str2
end 
task greeting(str name) yields "hi" + name
{1 -> "one", 2 -> "two"}
if x >= 0:
    bool greater = true 
end
else
    bool greater = false
end
if x !1 && x !2 mumble("x is not 1 or 2") 
end 
["1", "2", "3", "jump"]
{"one" -> 1, "two" -> 2}
`
const expected = `   1 | Program statements=[#2,#3,#4,#7,#8,#12,#18,#21,#24,#30,#36,#37]
   2 | PrintStatement argument=(Str,""hi there!"")
   3 | VariableDeclaration modifier=(Sym,"num") variable='x' initializer=(Int,"2")
   4 | FunctionDeclaration funName=(Id,"cube") params=[#5] returnExp=[#6] body=[]
   5 | Param name=(Sym,"num") type='y'
   6 | BinaryExpression left=(Id,"int") op='^' right=(Int,"3")
   7 | Call callee=(Id,"cube") args=[(Int,"12")]
   8 | IfShort tests=#9 consequent=#10
   9 | BinaryExpression left=(Id,"a") op='>=' right=(Int,"0")
  10 | Suite statements=[#11]
  11 | BinaryExpression left=(Id,"a") op='/' right=(Int,"2")
  12 | FunctionDeclaration funName=(Id,"combineStrings") params=[#13,#14] returnExp=[(Id,"combinedString")] body=[#15]
  13 | Param name=(Sym,"str") type='str1'
  14 | Param name=(Sym,"str") type='str2'
  15 | Suite statements=[#16]
  16 | VariableDeclaration modifier=(Sym,"str") variable='combinedString' initializer=#17
  17 | BinaryExpression left=(Id,"str1") op='+' right=(Id,"str2")
  18 | FunctionDeclaration funName=(Id,"greeting") params=[#19] returnExp=[#20] body=[]
  19 | Param name=(Sym,"str") type='name'
  20 | BinaryExpression left=(Str,""hi"") op='+' right=(Id,"name")
  21 | Dictionary expressions=[#22,#23]
  22 | Binding key=(Int,"1") value=(Str,""one"")
  23 | Binding key=(Int,"2") value=(Str,""two"")
  24 | IfLong tests=#25 consequent=#26 alternate=#28
  25 | BinaryExpression left=(Id,"x") op='>=' right=(Int,"0")
  26 | Suite statements=[#27]
  27 | VariableDeclaration modifier=(Sym,"bool") variable='greater' initializer=(Bool,"true")
  28 | Suite statements=[#29]
  29 | VariableDeclaration modifier=(Sym,"bool") variable='greater' initializer=(Bool,"false")
  30 | IfShort tests=#31 consequent=#34
  31 | BinaryExpression left=#32 op='&&' right=#33
  32 | BinaryExpression left=(Id,"x") op='!' right=(Int,"1")
  33 | BinaryExpression left=(Id,"x") op='!' right=(Int,"2")
  34 | Suite statements=[#35]
  35 | PrintStatement argument=(Str,""x is not 1 or 2"")
  36 | List elements=[(Str,""1""),(Str,""2""),(Str,""3""),(Str,""jump"")]
  37 | Dictionary expressions=[#38,#39]
  38 | Binding key=(Str,""one"") value=(Int,"1")
  39 | Binding key=(Str,""two"") value=(Int,"2")`

const mapSrc = `
map <str, num> m = {"a" -> 1, "b" -> 2}
`
const mapExpected = `   1 | Program statements=[#2]
   2 | VariableDeclaration modifier=#3 variable='m' initializer=#4
   3 | Type_maptype description='[str, num]' keyType=(Sym,"str") valueType=(Sym,"num")
   4 | Dictionary expressions=[#5,#6]
   5 | Binding key=(Str,""a"") value=(Int,"1")
   6 | Binding key=(Str,""b"") value=(Int,"2")`

describe("The AST generator", () => {
  it("produces a correct AST", () => {
    assert.deepStrictEqual(util.format(ast(source)), expected)
  })
  it("produces a correct AST with maps", () => {
    assert.deepStrictEqual(util.format(ast(mapSrc)), mapExpected)
  })
})

//describe("The error function", () => {
  //it("throws an error when called", () => {
   // assert.throws(error("Uh oh"))
 // })
//  })