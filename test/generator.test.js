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
        let x_1 = 3;
        let y_2 = 0;
        let z_3 = true;
        let hey_4 = "hey";
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
