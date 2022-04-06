import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  ["print string", 'mumble "hi"'],
  ["print float", "mumble -3.4"],
  ["print bools", "mumble true"],
  ["variable declaration", "int x = 3"],
  [
    "function declaration",
    `#my_func:
      mumble str_1
    #`,
  ],
  [
    "function calls",
    `
      @ function declaration
      #print_values:
        mumble str_1
      #
      @ function call 
      b #print_values`,
  ],
  [
    "cmp instruction",
    `
    str three = "3"
    cmp 3 three
    `,
  ],
]

const semanticErrors = [
  [
    "redeclare function",
    `
    #my_func:
      mumble "hello"
    #
    #my_func:
      int x = 0
    #   
    `,
    /Error: Function #my_func already declared/,
  ],
  [
    "function that has not yet been declared",
    `
      @ function declaration
      #print_values:
        mumble str_1
      #
      @ function call 
      bl #my_func`,
    /Error: Function #my_func has not yet been declared/,
  ],
  [
    "variable that has not yet been declared",
    `
    str x = "hi"
    str x = "hello" 
    `,
    /Error: Variable x already declared/,
  ],
  [
    "cmp instruction with undeclared var",
    `
    str three = "3"
    cmp 3 four
    `,
    /Error: Variable four is undeclared/,
  ],
  [
    "cmp instruction with wrong number of args",
    "cmp 1 2 3",
    /Error: cmp instruction must have exactly two arguments/,
  ],

  // ["print undeclared identifier", "mumble hi", /Malformed print statement/],
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(ast(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(ast(source)), errorMessagePattern)
    })
  }
})
