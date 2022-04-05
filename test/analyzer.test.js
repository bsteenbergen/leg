import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

// Programs that are semantically correct
const semanticChecks = [
  // ["print string", 'print "hi"'],
  // ["print float", "print -3.4"],
  ["variable declaration", "int x = 3"],
]

const semanticErrors = [
  ["print undeclared identifier", "print hi", /Malformed print statement/],
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
