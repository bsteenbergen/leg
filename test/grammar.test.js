import assert from "assert"
import ast from "../src/ast.js"

// Programs expected to be syntactically correct
const syntaxChecks = [
  ["simplest syntactically correct program", 'prt "hi"'],
  ["list declaration", 'list letters = ["a", "b", "c"]'],
  ["empty list declaration", "list letters = []"],
  ["reassign list", "letters = [1, 2, 3]"],
  ["add instruction (numbers)", "add 1 3 result"],
  ["add instruction (strings)", 'add [1, 2, 3] ["cat", "dog"] result'],
]

// Programs with syntax errors that the parser will detect
const syntaxErrors = []

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`recognizes ${scenario}`, () => {
      assert(ast(source))
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => ast(source), errorMessagePattern)
    })
  }
})
