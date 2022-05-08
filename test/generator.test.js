import assert from "assert/strict"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
  {
    name: "miniscule",
    source: `
      prt "hello world"
    `,
    expected: dedent`
      console.log("hello world");
    `,
  },
  {
    name: "variable declaration",
    source: `
        decl int x 3
        decl int y 0
        decl bool z true
        decl int big 9007199254740991
        decl str hey "hey"
      `,
    expected: dedent`
        let x_1 = 3;
        let y_2 = 0;
        let z_3 = true;
        let big_4 = 9007199254740991;
        let hey_5 = "hey";
      `,
  },
  {
    name: "variable assignment",
    source: `
        decl int x 5
        decl int y 1
        asgn y x
        prt y
    `,
    expected: dedent`
        let x_1 = 5;
        let y_2 = 1;
        y_2 = x_1;
        console.log(1);
    `,
  },
  {
    name: "small",
    source: `
      decl int x 3
      decl bool y true
      decl bool z true
      asgn z !z
      prt z
      prt y && y
      prt x^x
    `,
    expected: dedent`
      let x_1 = 3;
      let y_2 = true;
      let z_3 = true;
      z_3 = !(z_3)
      console.log(false);
      console.log((true && true));
      console.log(27);
    `,
  },
  {
    name: "function",
    source: `
    #my_func:
      decl int x 5
      prt x
    #
    `,
    expected: dedent`
    function my_func_1() {
      let x_2 = 5;
      console.log(x_2);
    }
    `,
  },
  {
    name: "if",
    source: `
    decl int x 0
    #if x > 5:
      prt 1
    # else:
      prt 2
    #
    `,
    expected: dedent`
      let x_1 = 0;
      if ((x_1 > 5)) {
        console.log(1);
      } else {
        console.log(2);
      }
    `,
  },
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(ast(fixture.source))))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})
