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
        decl str hey "hey"
      `,
    expected: dedent`
        let x = 3;
        let y = 0;
        let z = true;
        let hey = "hey";
      `,
  },
  {
    name: "variable assignment",
    source: `
        decl int x 5
        decl int y 1
        asgn y y + x
        prt y
    `,
    expected: `
        let x = 5;
        let y = 1;
        y = y + x;
        console.log(y);
    `,
  },
  {
    name: "small",
    source: `
      decl int x 3
      decl bool y true
      prt y && y
      prt x^x
    `,
    expected: dedent`
      let x = 3;
      let y = true;
      console.log((y && y));
      console.log((x ** x));
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
