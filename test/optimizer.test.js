import assert from "assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

const x = 9
// const x = new core.Variable(core.Type.INT, "x", 100)
const neg = (x) => new core.UnaryExpression("-", x)

const tests = [
  ["folds +", new core.BinaryExpression(5, "+", 8), 13],
  ["folds -", new core.BinaryExpression(5, "-", 8), -3],
  ["folds *", new core.BinaryExpression(5, "*", 8), 40],
  ["folds /", new core.BinaryExpression(5, "/", 8), 0.625],
  ["folds ^", new core.BinaryExpression(5, "^", 8), 390625],
  ["folds <", new core.BinaryExpression(5, "<", 8), true],
  ["folds <=", new core.BinaryExpression(5, "<=", 8), true],
  ["folds ==", new core.BinaryExpression(5, "==", 8), false],
  ["folds !=", new core.BinaryExpression(5, "!=", 8), true],
  ["folds >=", new core.BinaryExpression(5, ">=", 8), false],
  ["folds >", new core.BinaryExpression(5, ">", 8), false],
  ["optimizes /1", new core.BinaryExpression(x, "/", 1), x],
  ["optimizes *0", new core.BinaryExpression(x, "*", 0), 0],
  ["optimizes 0*", new core.BinaryExpression(0, "*", x), 0],
  ["optimizes 0/", new core.BinaryExpression(0, "/", x), 0],
  ["optimizes 0+", new core.BinaryExpression(0, "+", x), x],
  ["optimizes 0-", new core.BinaryExpression(0, "-", x), -1 * x],
  ["optimizes 1*", new core.BinaryExpression(1, "*", x), x],
  ["folds negation", new core.UnaryExpression("-", 8), -8],
  ["optimizes 1**", new core.BinaryExpression(1, "^", x), 1],
  ["optimizes **0", new core.BinaryExpression(x, "^", 0), 1],
  [
    "folds result of add instruction on two integers",
    new core.Variable(core.Type.INT, "result", [10, "add", 20]),
    new core.Variable(core.Type.INT, "result", 30),
  ],
  [
    "folds result of sub instruction on two integers",
    new core.Variable(core.Type.INT, "result", [10, "sub", 20]),
    new core.Variable(core.Type.INT, "result", -10),
  ],
  [
    "folds result of cmp instruction on two integers",
    new core.Variable(core.Type.INT, "result", [10, "cmp", 20]),
    new core.Variable(core.Type.INT, "result", false),
  ],
  [
    "passes through nonoptimizable constructs",
    ...Array(2).fill([
      new core.Program([
        `decl str three "3"`,
        `decl bool result false`,
        `cmp result 3 three`,
      ]),
      new core.VariableDeclaration(core.Type.INT, "x", 100),
      new core.VariableAssignment("x", new core.BinaryExpression("y", "*", "z")),
      new core.VariableAssignment(x, new core.UnaryExpression("-", x)),
    ]),
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})
