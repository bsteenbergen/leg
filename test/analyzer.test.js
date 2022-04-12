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
  ["print string", 'prt "hi"'],
  ["print float", "prt -3.4"],
  ["print bools", "prt true"],
  ["variable declaration", "int x = 3"],
  ["list declaration", 'list letters = ["a", "b", "c"]'],
  [
    "function declaration",
    `
    int str_1 = 9
    #my_func:
      prt str_1
    #`,
  ],
  [
    "function calls",
    `
      @ function declaration
      #print_values:
        int str_1 = 9
        prt str_1
      #
      @ function call 
      b #print_values`,
  ],
  [
    "valid cmp instruction with undeclared result variable",
    `
    str three = "3"
    cmp 3 three result
    `,
  ],
  [
    "valid cmp instruction with pre-declared result variable",
    `
    str three = "3"
    bool result = false
    cmp 3 three result
    `,
  ],
  [
    "valid add instruction with undeclared result variable",
    `
    add 3 5 sum
    `,
  ],
  [
    "valid add instruction with pre-declared result variable",
    `
    list sum = []
    add [1, 2, 3] [4, 5, 6] sum
    `,
  ],
  [
    "valid sub instruction with undeclared result variable",
    `
    sub "hello" "goodbye" result
    `,
  ],
  [
    "valid sub instruction with pre-declared result variable",
    `
    list diff = []
    sub [1, 2, 3] [1, 2, 3, 4, 5, 6] diff
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
	    prt "hi"
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
      prt "hello"
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
        prt str_1
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
    str result = ""
    cmp 3 four result
    `,
    /Error: Variable four is undeclared/,
  ],
  [
    "cmp instruction with wrong number of args",
    "cmp 1 2",
    /Error: cmp instruction must have exactly three arguments/,
  ],
  [
    "cmp instruction with non-boolean result variable",
    `
    str r = ""
    cmp 1 2 r
    `,
    /Error: Result of comparison r must be a boolean/,
  ],
  [
    "add instruction with wrong number of args",
    "add 1 2",
    /Error: add instruction must have exactly three arguments/,
  ],
  [
    "add instruction with args of different types",
    'add 1.0 "hello" result',
    /Error: add instruction parameters must be the same type/,
  ],
  [
    "add instruction with result of incorrect type",
    `
    list l1 = ["hello"]
    list l2 = ["world"]
    int result = 0
    add l1 l2 result
    `,
    /Error: Result of add instruction must be same type as arguments/,
  ],
  [
    "add instruction with uninitialized value to compare",
    "add 1 my_int result",
    /Error: Variable my_int is undeclared/,
  ],
  [
    "variable initilized with wrong type",
    "str x = 19",
    /Error: Initializer type does not match variable type/,
  ],
  [
    "print undeclared identifier",
    "prt hi",
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
      prt "hi"
    #
    `,
    /Error: If statement condition must evaluate to a boolean/,
  ],
  [
    "if statement condition is an id that does not represent a boolean",
    `
    float my_var = 14.5
    #if my_var:
      prt "hi"
    #
    `,
    /Error: If statement condition must evaluate to a boolean/,
  ],
  [
    "if statement condition uninitialized id",
    `
    #if my_var:
      prt "hi"
    #
    `,
    /Error: Must initialize variables before use in conditional expression/,
  ],
  // [
  //   "while loop with nonsensical condition",
  //   `
  //   #loop:
  //     prt "hi"
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
