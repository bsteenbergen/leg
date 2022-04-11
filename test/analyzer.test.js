import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  [
    "initialize variable to variable",
    `
    str s = "hi"
    str s2 = s`,
  ],
  ["print string", 'mumble "hi"'],
  ["print float", "mumble -3.4"],
  ["print bools", "mumble true"],
  ["variable declaration", "int x = 3"],
  [
    "function declaration",
    `
    int str_1 = 9
    #my_func:
      mumble str_1
    #`,
  ],
  [
    "function calls",
    `
      @ function declaration
      #print_values:
        int str_1 = 9
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
  [
    "increment variable",
    `
    float x = 1.0
    x = x + 0.2
    `,
  ],
  [
    "if statement with binary expression condition",
    `
    #if x < 1 :
      x = x + 1
    #
    `,
  ],
  [
    "if statement with bool var condition (id)",
    `
    bool my_var = true
    #if my_var :
      int x = 10
    #
    `,
  ],
  [
    "if statement with bool var condition (true)",
    `
    #if true :
      int x = 10
    #
    `,
  ],
  [
    "if statement with bool var condition (relop)",
    `
    int my_var = 9
    #if my_var == 9 :
      int x = 10
    #
    `,
  ],
  [
    "while loop",
    `
    #loop:
	    mumble "hi"
      b #loop x < 10 @ "loop only if x < 10
    #
    `,
  ],
  [
    "intialize variable as result of binary expression",
    `
    int j = 10
    bool i = 9 > j
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
    "initialize to uninitialized variable",
    `
    int j = k
    `,
    /Error: Initializer k has not been initalized./,
  ],
  [
    "initialize non-bool var to result of boolean expression",
    `
    int j = 19 < 9
    `,
    /Error: Variable j is being initalized to result of binary expression but is not type bool/,
  ],
  [
    "function that has not yet been declared",
    `
      @ function declaration
      #print_values:
        str str_1 = "hello"
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
  [
    "variable initilized with wrong type",
    "str x = 19",
    /Error: Initializer type does not match variable type/,
  ],
  [
    "print undeclared identifier",
    "mumble hi",
    /Error: Print statement argument "hi" is uninitialized/,
  ],
  [
    "increment untilitialized variable",
    `
    x = x + 0.2
    `,
    /Error: Must initialize variables before asignment/,
  ],
  [
    "if statement condition that is neither a bool nor an id",
    `
    #if 14:
      mumble "hi"
    #
    `,
    /Error: If statement condition must evaluate to a boolean/,
  ],
  [
    "if statement condition is an id that does not represent a boolean",
    `
    float my_var = 14.5
    #if my_var:
      mumble "hi"
    #
    `,
    /Error: If statement condition must evaluate to a boolean/,
  ],
  [
    "if statement condition uninitialized id",
    `
    #if my_var:
      mumble "hi"
    #
    `,
    /Error: Must initialize variables before use in conditional expression/,
  ],
  // [
  //   "while loop with nonsensical condition",
  //   `
  //   #loop:
  //     mumble "hi"
  //     b #loop x < true @
  //   #
  //   `,
  //   /Error: Must initialize variables before use in conditional expression/,
  // ],
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
