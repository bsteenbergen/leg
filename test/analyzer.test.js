import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  ["variable declarations", 'num x = 1 bool y = "false"'],
  // ["complex array types", "function f(x: [[[int?]]?]) {}"],
  // ["increment and decrement", "let x = 10 x-- x++"],
  ["initialize with empty list", "list a = []"],
  // ["type declaration", "struct S {f: (int)->boolean? g: string}"],
  ["assign arrays", "list a = [] list b=[1] a=b b=a"],
  // ["assign to array element", "list a=[1,2,3] a[1]=100"],
  // ["initialize with empty optional", "let a = no int;"],
  ["short return", "task f(): end"],
  ["long return", "task f() yields b: b = true end"],
  // ["assign optionals", "let a = no int;let b=some 1;a=b;b=a;"],
  // ["return in nested if", "function f() {if true {return;}}"],
  // ["break in nested if", "while false {if true {break;}}"],
  ["long if", "if true: mumble(1) end else: mumble(3) end"],
  [
    "else if",
    "if true: mumble(1) end else if true: mumble(0) end else: mumble(3) end",
  ],
  // ["for over collection", "for i in [2,3,5] {print(1)}"],
  // ["for in range", "for i in 1..<10 {print(0)}"],
  // ["repeat", "repeat 3 {let a = 1; print(a);}"],
  // ["conditionals with ints", "print(true ? 8 : 5);"],
  // ["conditionals with floats", "print(1<2 ? 8.0 : -5.22)"],
  // ["conditionals with strings", 'print(1<2 ? "x" : "y")'],
  // ["??", "print(some 5 ?? 0);"],
  // ["nested ??", "print(some 5 ?? 8 ?? 0);"],
  ["||", "mumble(true||1<2||false||!true)"],
  ["&&", "mumble(true&&1<2&&false&&!true)"],
  ["bit ops", "mumble((1&2)|(9^3))"],
  ["relations", 'mumble(1<=2 && "x">"y" && 3.5<1.2)'],
  ["ok to == lists", "mumble([1]==[5,8])"],
  ["ok to != lists", "mumble([1]!=[5,8])"],
  ["arithmetic", "num x=1 mumble(2*3+5**-3/2-5%8)"],
  // ["array length", "print(#[1,2,3]);"],
  // ["optional types", "let x = no int x = some 100"],
  // ["variables", "let x=[[[[1]]]]; print(x[0][0][0][0]+2);"],
  // ["recursive structs", "struct S {z: S?} let x = S(no S);"],
  // [
  //   "nested structs",
  //   "struct T{y:int} struct S{z: T} let x=S(T(1)); print(x.z.y);",
  // ],
  // ["member exp", "struct S {x: int} let y = S(1);print(y.x);"],
  // ["subscript exp", "let a=[1,2];print(a[0]);"],
  // ["array of struct", "struct S{} let x=[S(), S()];"],
  // ["struct of arrays and opts", "struct S{x: [int] y: string??}"],
  // ["assigned functions", "function f() {}\nlet g = f;g = f;"],
  // ["call of assigned functions", "function f(x: int) {}\nlet g=f;g(1);"],
  // [
  //   "type equivalence of nested arrays",
  //   "function f(x: [[int]]) {} print(f([[1],[2]]));",
  // ],
  // [
  //   "call of assigned function in expression",
  //   `function f(x: int, y: boolean): int {}
  //   let g = f;
  //   print(g(1, true));
  //   f = g; // Type check here`,
  // ],
  // [
  //   "pass a function to a function",
  //   `function f(x: int, y: (boolean)->void): int { return 1; }
  //    function g(z: boolean) {}
  //    f(2, g);`,
  // ],
  // [
  //   "function return types",
  //   `function square(x: int): int { return x * x; }
  //    function compose(): (int)->int { return square; }`,
  // ],
  // [
  //   "function assign",
  //   "function f() {} let g = f; let h = [g, f]; print(h[0]());",
  // ],
  // ["struct parameters", "struct S {} function f(x: S) {}"],
  // ["array parameters", "function f(x: [int?]) {}"],
  // ["optional parameters", "function f(x: [int], y: string?) {}"],
  // ["empty optional types", "print(no [int]); print(no string);"],
  // ["types in function type", "function f(g: (int?, float)->string) {}"],
  // ["voids in fn type", "function f(g: (void)->void) {}"],
  // ["outer variable", "let x=1; while(false) {print(x);}"],
  // ["built-in constants", "print(25.0 * π);"],
  // ["built-in sin", "print(sin(π));"],
  // ["built-in cos", "print(cos(93.999));"],
  // ["built-in hypot", "print(hypot(-4.0, 3.00001));"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  // ["non-distinct fields", "struct S {x: boolean x: int}", /Fields must be distinct/],
  ["non-int increment", "bool x=false x++", /an integer/],
  ["non-int decrement", 'str x="" x++', /an integer/],
  ["undeclared id", "mumble(x)", /Identifier x not declared/],
  ["redeclared id", "num x = 1 num x = 1", /Identifier x already declared/],
  // ["recursive struct", "struct S { x: int y: S }", /must not be recursive/],
  // ["assign to const", "const x = 1;x = 2;", /Cannot assign to constant x/],
  ["assign bad type", "num x=1 x=true", /Cannot assign a boolean to a int/],
  [
    "assign bad list type",
    "num x=1;x=[true]",
    /Cannot assign a \[boolean\] to a int/,
  ],
  // ["assign bad optional type", "let x=1;x=some 2;", /Cannot assign a int\? to a int/],
  ["end outside loop", "end", /Break can only appear in a loop/],
  // [
  //   "break inside function",
  //   "while true {function f() {break;}}",
  //   /Break can only appear in a loop/,
  // ],
  // [
  //   "return outside function",
  //   "return;",
  //   /Return can only appear in a function/,
  // ],
  // [
  //   "return value from void function",
  //   "function f() {return 1;}",
  //   /Cannot return a value here/,
  // ],
  // [
  //   "return nothing from non-void",
  //   "task f() yields int: return",
  //   /should be returned here/,
  // ],
  [
    "return type mismatch",
    "task f() yields int: return false",
    /boolean to a int/,
  ],
  ["non-boolean short if test", "if 1 {}", /Expected a boolean/],
  ["non-boolean if test", "if 1 {} else {}", /Expected a boolean/],
  // ["non-boolean while test", "while 1 {}", /Expected a boolean/],
  // ["non-integer repeat", 'repeat "1" {}', /Expected an integer/],
  // ["non-integer low range", "for i in true...2 {}", /Expected an integer/],
  // ["non-integer high range", "for i in 1..<no int {}", /Expected an integer/],
  // ["non-array in for", "for i in 100 {}", /Array expected/],
  // ["non-boolean conditional test", "print(1?2:3);", /Expected a boolean/],
  // [
  //   "diff types in conditional arms",
  //   "print(true?1:true);",
  //   /not have the same type/,
  // ],
  // ["unwrap non-optional", "print(1??2);", /Optional expected/],
  ["bad types for ||", "print(false||1);", /Expected a boolean/],
  ["bad types for &&", "print(false&&1);", /Expected a boolean/],
  [
    "bad types for ==",
    "print(false==1);",
    /Operands do not have the same type/,
  ],
  [
    "bad types for !=",
    "print(false==1);",
    /Operands do not have the same type/,
  ],
  ["bad types for +", "print(false+1);", /Expected a number or string/],
  ["bad types for -", "print(false-1);", /Expected a number/],
  ["bad types for *", "print(false*1);", /Expected a number/],
  ["bad types for /", "print(false/1);", /Expected a number/],
  ["bad types for **", "print(false**1);", /Expected a number/],
  ["bad types for <", "print(false<1);", /Expected a number or string/],
  ["bad types for <=", "print(false<=1);", /Expected a number or string/],
  ["bad types for >", "print(false>1);", /Expected a number or string/],
  ["bad types for >=", "print(false>=1);", /Expected a number or string/],
  ["bad types for ==", "print(2==2.0);", /not have the same type/],
  ["bad types for !=", "print(false!=1);", /not have the same type/],
  ["bad types for negation", "print(-true);", /Expected a number/],
  // ["bad types for length", "print(#false);", /Array expected/],
  ["bad types for not", 'print(!"hello");', /Expected a boolean/],
  // ["non-integer index", "let a=[1];print(a[false]);", /Expected an integer/],
  // ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
  [
    "diff type array elements",
    "mumble([3,'hello']);",
    /Not all elements have the same type/,
  ],
  // [
  //   "shadowing",
  //   "let x = 1;\nwhile true {let x = 1;}",
  //   /Identifier x already declared/,
  // ],
  // ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
  // [
  //   "Too many args",
  //   "function f(x: int) {}\nf(1,2);",
  //   /1 argument\(s\) required but 2 passed/,
  // ],
  // [
  //   "Too few args",
  //   "function f(x: int) {}\nf();",
  //   /1 argument\(s\) required but 0 passed/,
  // ],
  [
    "Parameter type mismatch",
    "function f(x: int) {}\nf(false);",
    /Cannot assign a boolean to a int/,
  ], // do we declare the type in our functions?

  // [
  //   "function type mismatch",
  //   `function f(x: int, y: (boolean)->void): int { return 1; }
  //    function g(z: boolean): int { return 5; }
  //    f(2, g);`,
  //   /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
  // ],
  // [
  //   "bad call to stdlib sin()",
  //   "print(sin(true));",
  //   /Cannot assign a boolean to a float/,
  // ],
  // ["Non-type in param", "let x=1;function f(y:x){}", /Type expected/],
  // [
  //   "Non-type in return type",
  //   "let x=1;function f():x{return 1;}",
  //   /Type expected/,
  // ],
  // ["Non-type in field type", "let x=1;struct S {y:x}", /Type expected/],
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
