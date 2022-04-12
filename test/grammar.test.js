import assert from "assert"
import ast from "../src/ast.js"

// Programs expected to be syntactically correct
const syntaxChecks = [
  ["simplest syntactically correct program", 'prt "hi"'],
  [
    "if statement",
    `
    #if x < 1 :
	    x = x + 1
    #
    `,
  ],
  [
    "loop",
    `
    #loop:
	    mumble "hi"
      b #loop x < 10 @ "loop only if x < 10
    #
    `,
  ],
  [
    "if else block",
    `
    #if !raining:
      prt "It's not raining!"
    #else: 
      prt "Bring an umbrella!"
    #
    `,
  ],
  ["list declaration", 'list letters = ["a", "b", "c"]'],
  ["empty list declaration", "list letters = []"],
  ["reassign list", "letters = [1, 2, 3]"],
  ["cmp instruction", "cmp var_1 var_2 result"],
  ["add instruction (numbers)", "add 1 3 result"],
  ["add instruction (lists)", 'add [1, 2, 3] ["cat", "dog"] x'],
  ["sub instruction (strings)", 'sub "hi" " and shalom" result'],
  ["sub instruction (floats)", "sub 9.999 -10.0 r"],
]

// Programs with syntax errors that the parser will detect
const syntaxErrors = [
  ["malformed print statement", 'prt("hi")'],
  ["keyword as variable name 1", "bool true = true"],
  ["keyword as variable name 2", "int #if = 10"],
  ["symbol as variable name", "int # = 11"],
  ["space as variable name", "int   = 11"],
  [
    "malformed if statement",
    `
    if x > 1:
      prt 3
    `,
  ],
  [
    "else without an if",
    `
    else:
      prt 3
    #
    `,
  ],
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
