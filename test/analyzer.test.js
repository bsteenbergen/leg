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
    `#my_func str_1 str_2:
      mumble str_1
    #`,
  ],
]

const semanticErrors = [
  ["print undeclared identifier", "mumble hi", /Malformed print statement/],
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(ast(source)))
    })
  }
  // for (const [scenario, source, errorMessagePattern] of semanticErrors) {
  //   it(`throws on ${scenario}`, () => {
  //     assert.throws(() => analyze(ast(source)), errorMessagePattern)
  //   })
  // }
})
