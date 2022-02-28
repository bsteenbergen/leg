import assert from "assert"
import ast from "../src/ast.js"

// Programs expected to be syntactically correct
const syntaxChecks = [
  ["simplest syntactically correct program", "break"],
  ["multiple statements", 'mumble("hey")\nbreak\nreturn'],
  ["variable declarations", "str s = 'silly'"],
  ["type declarations", "num n = 2"],
  ["function with one param", "task square(num) yields num^2"],
  ["function with two params", "task combineStrings(str str1, str str2) yields combinedString:\ncombinedString = str1 + str2\nend"],
  ["array type returned", "task returnList() yields List"],
  ["assignments", "abc=9*3 a=1"],
  ["short if", 'if (true): mumble("good!")'],
  ["while with empty block", "while true"],
  ["while with one statement block", "while true num x = 1"],
  ["for half-open range", "num i = 1\nloop until i > 10:\ni += 1\nend"],
  ["for closed range", "num i = 1\nloop until i > 10:\ni += 1\nend"],
  ["relational operators", 'mumble(1<2||1<=2||1==2||1!=2||1>=2||1>2)'],
  ["arithmetic", "task arithmetic() yields 2 * x + 3 / 5 - 7 "],
  ["empty array literal", "List l = []\nmumble(l)"],
  ["nonempty array literal", "List l = [5, 2]\nmumble(l)"],
  ["parentheses", "mumble(83 * (((((((((13 / 21))))))))) + 1 - 0)"],
  ["non-Latin letters in identifiers", "let コンパイラ = 100"],
  ["a simple string literal", 'mumble("😎💯")'],
  ["end of program inside comment", "mumble(0) // yay"],
  ["comments with no text", "mumble(1)//\nmumble(0)//"]
]

// Programs with syntax errors that the parser will detect
const syntaxErrors = [
  ["non-letter in an identifier", "str ab😭c = 2", /Line 1, col 7:/],
  ["malformed number", "num x = 2.", /Line 1, col 10:/],
  ["a missing right operand", "mumble(5 -)", /Line 1, col 10:/],
  ["a non-operator", "mumble(7 * ((2 _ 3))", /Line 1, col 15:/],
  ["an expression starting with a )", "yield )", /Line 1, col 8:/],
  ["a statement starting with a )", "mumble(5)\n)", /Line 2, col 1:/],
  ["an expression starting with a *", "num x = * 71", /Line 1, col 9:/],
  ["if as identifier", "str if = 2", /Line 1, col 5/],
  ["empty array without type declaration", "mumble([])", /Line 1, col 9/],
  ["bad array literal", "List l = [2, 3,]", /Line 1, col 12/],
  ["true is not assignable", "bool true = 1", /Line 1, col 5/],
  ["false is not assignable", "bool false = 1", /Line 1, col 6/],
  ["string lit with unknown escape", 'mumble("ab\\zcdef")', /col 11/],
  ["string lit with newline", 'mumble("ab\\zcdef")', /col 11/],
  ["string lit with quote", 'mumble("ab\\zcdef")', /col 11/],
  ["string lit with code point too long", 'mumble("\\u{1111111}")', /col 17/]
]

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`recognizes ${scenario}`, () => {
      assert(ast(source))
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => ast(source), errorMessagePattern)
    })
  }
})