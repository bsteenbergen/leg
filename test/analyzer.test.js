import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  [
    "initialize variable to variable",
    `
    decl str s "hi"
    decl str s2 s`,
  ],
  ["print string", 'prt "hi"'],
  ["print float", "prt -3.4"],
  ["print bools", "prt true"],
  ["variable declaration", "decl int x 3"],
  [
    "list declaration",
    `
    decl list letters ["a", "b", "c"]
  `,
  ],
  // [
  //   "list declaration",
  //   `
  //   decl str letter "b"
  //   decl list letters ["a", letter, "c"]
  // `,
  // ],
  [
    "function declaration",
    `
    decl int int_1 9
    #my_func:
      prt int_1
      decl int int_2 10
    #`,
  ],
  [
    "function calls",
    `
      @ function declaration
      #print_values:
        decl int i_1 9
        prt i_1
      #
      @ function call 
      b #print_values`,
  ],
  [
    "valid cmp instruction with undeclared result variable",
    `
    decl str three "3"
    cmp result 3 three
    `,
  ],
  [
    "valid cmp instruction with pre-declared result variable",
    `
    decl str three "3"
    decl bool result false
    cmp result 3 three
    `,
  ],
  [
    "valid add instruction with undeclared result variable",
    `
    add sum 3 5
    `,
  ],
  [
    "valid add instruction with pre-declared result variable",
    `
    decl list sum []
    add sum [1, 2, 3] [4, 5, 6]
    `,
  ],
  [
    "valid sub instruction with undeclared result variable",
    `
    sub result "hello" "goodbye" 
    `,
  ],
  [
    "valid sub instruction with pre-declared result variable",
    `
    decl list diff []
    sub diff [1, 2, 3] [1, 2, 3, 4, 5, 6]
    `,
  ],
  [
    "increment variable",
    `
    decl float x 1.0
    asgn x x + 0.2
    `,
  ],
  [
    "if statement with binary expression condition",
    `
    decl int x 0
    #if x < 1 :
      prt x
      asgn x x + 1
    #
    `,
  ],
  [
    "if statement with bool var condition (id)",
    `
    decl bool my_var true
    #if my_var :
      decl int x 10
    #
    `,
  ],
  [
    "if statement with bool var condition (true)",
    `
    #if true :
      decl int x 10
    #
    `,
  ],
  [
    "if statement with bool var condition (relop)",
    `
    decl int my_var 9
    #if my_var == 9 :
      prt 9
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
    decl int j 10
    decl bool i 9 > j
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
      decl int x 0
    #   
    `,
    /Error: Function #my_func already declared/,
  ],
  [
    "initialize to uninitialized variable",
    `
    decl int j k
    `,
    /Error: k has not been initalized./,
  ],
  [
    "initialize non-bool var to result of boolean expression",
    `
    decl int j 19 < 9
    `,
    /Error: Variable j is being initalized to result of binary expression but is not type bool/,
  ],
  [
    "function that has not yet been declared",
    `
      @ function declaration
      #print_values:
        decl str str_1 "hello"
        prt str_1
      #
      @ function call 
      bl #my_func`,
    /Error: Function #my_func has not yet been declared/,
  ],
  [
    "variable that has already been declared",
    `
    decl str x "hi"
    decl str x "hello" 
    `,
    /Error: Variable x already declared/,
  ],
  [
    "cmp instruction with undeclared var",
    `
    decl str three "3"
    decl bool result false
    cmp result 3 four
    `,
    /Error: Variable four is undeclared/,
  ],
  [
    "cmp instruction with wrong number of args",
    "cmp 1 2",
    /Error: Instruction must have exactly 3 arguments/,
  ],
  [
    "cmp instruction with non-boolean result variable",
    `
    decl str r ""
    cmp r 1 2
    `,
    /Error: Result of comparison r must be a boolean/,
  ],
  [
    "add instruction with wrong number of args",
    "add 1 2",
    /Error: Instruction must have exactly 3 arguments/,
  ],
  [
    "add instruction with args of different types",
    'add result 1.0 "hello"',
    /Error: add instruction parameters must be the same type/,
  ],
  [
    "add instruction with result of incorrect type",
    `
    decl list l1 ["hello"]
    decl list l2 ["world"]
    decl int result 0
    add result l1 l2
    `,
    /Error: Result of instruction must be same type as arguments/,
  ],
  [
    "add instruction with uninitialized value to compare",
    "add result 1 my_int",
    /Error: Variable my_int is undeclared/,
  ],

  [
    "variable initilized with wrong type",
    "decl str x 19",
    /Error: Initializer type does not match variable type/,
  ],
  ["print undeclared identifier", "prt hi", /hi has not been initialized/],
  [
    "increment untilitialized variable",
    `
    asgn x x + 0.2
    `,
    /Error: Must initialize variables before assignment/,
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
    decl float my_var 14.5
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
