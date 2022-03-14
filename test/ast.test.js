import assert from "assert"
import util from "util"
import ast from "../src/ast.js"

// TODO: This test case needs a lot more work
const source = `
mumble("hi there!")
num x = 2
task cube(num y) yields int^3
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
const expected = `   1 | Program statements=[#2,#3,#4,#7,#11,#17,#20,#23,#29,#35,#36]
   2 | PrintStatement argument=(Str,""hi there!"")
   3 | VariableDeclaration modifier=(Sym,"num") variable='x' initializer=(Int,"2")
   4 | FunctionDeclaration funName=(Id,"cube") params=[#5] returnExp=[#6] body=[]
   5 | Param name=(Sym,"num") type='y'
   6 | BinaryExpression left=(Id,"int") op='^' right=(Int,"3")
   7 | IfShort tests=#8 consequent=#9
   8 | BinaryExpression left=(Id,"a") op='>=' right=(Int,"0")
   9 | Suite statements=[#10]
  10 | BinaryExpression left=(Id,"a") op='/' right=(Int,"2")
  11 | FunctionDeclaration funName=(Id,"combineStrings") params=[#12,#13] returnExp=[(Id,"combinedString")] body=[#14]
  12 | Param name=(Sym,"str") type='str1'
  13 | Param name=(Sym,"str") type='str2'
  14 | Suite statements=[#15]
  15 | VariableDeclaration modifier=(Sym,"str") variable='combinedString' initializer=#16
  16 | BinaryExpression left=(Id,"str1") op='+' right=(Id,"str2")
  17 | FunctionDeclaration funName=(Id,"greeting") params=[#18] returnExp=[#19] body=[]
  18 | Param name=(Sym,"str") type='name'
  19 | BinaryExpression left=(Str,""hi"") op='+' right=(Id,"name")
  20 | Dictionary expressions=[#21,#22]
  21 | Binding key=(Int,"1") value=(Str,""one"")
  22 | Binding key=(Int,"2") value=(Str,""two"")
  23 | IfLong tests=#24 consequent=#25 alternate=#27
  24 | BinaryExpression left=(Id,"x") op='>=' right=(Int,"0")
  25 | Suite statements=[#26]
  26 | VariableDeclaration modifier=(Sym,"bool") variable='greater' initializer=(Bool,"true")
  27 | Suite statements=[#28]
  28 | VariableDeclaration modifier=(Sym,"bool") variable='greater' initializer=(Bool,"false")
  29 | IfShort tests=#30 consequent=#33
  30 | BinaryExpression left=#31 op='&&' right=#32
  31 | BinaryExpression left=(Id,"x") op='!' right=(Int,"1")
  32 | BinaryExpression left=(Id,"x") op='!' right=(Int,"2")
  33 | Suite statements=[#34]
  34 | PrintStatement argument=(Str,""x is not 1 or 2"")
  35 | List elements=[(Str,""1""),(Str,""2""),(Str,""3""),(Str,""jump"")]
  36 | Dictionary expressions=[#37,#38]
  37 | Binding key=(Str,""one"") value=(Int,"1")
  38 | Binding key=(Str,""two"") value=(Int,"2")`

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
