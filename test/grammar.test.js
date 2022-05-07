import assert from "assert"
import ast from "../src/ast.js"

// Programs expected to be syntactically correct
const syntaxChecks = [
  ["simplest syntactically correct program", 'prt "hi"'],
  [
    "declaration for vars of all acceptable types",
    `@ variable declaration
    decl int l 0 
    decl str s "hi"
    decl float f -9.99
    decl bin b1 00110101b`,
  ],
  [
    "assignment for vars of all acceptable types",
    `@ variable assignment
    asgn l 0 
    asgn s "hi"
    asgn f -9.99
    asgn b1 00110101b`,
  ],
  [
    "if statement",
    `
    #if x < 1 :
      asgn x x + 1
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
  ["list declaration", 'decl [str] letters ["a", "b", "c"]'],
  ["empty list declaration", "decl [] letters []"],
  ["reassign list", "asgn letters [1, 2, 3]"],
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
