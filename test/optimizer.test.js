import assert from "assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

const x = 9

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
  ["removes left false from ||", new core.BinaryExpression(false, "||", 0), 0],
  ["removes right false from ||", new core.BinaryExpression(0, "||", false), 0],
  [
    "removes left true from &&",
    new core.BinaryExpression(true, "&&", new core.BinaryExpression(3, "*", x)),
    27,
  ],
  [
    "removes left true from &&",
    new core.BinaryExpression(new core.BinaryExpression(3, "*", x), "&&", true),
    27,
  ],
  /*
  [
    "folds result of add instruction on two integers",
    new core.Variable(core.Type.INT, "result", new core.BinaryExpression(10, "+", 30)),
    new core.Variable(core.Type.INT, "result", 40),
  ],
  [
    "folds result of sub instruction on two integers",
    new core.Variable(core.Type.INT, "result", new core.BinaryExpression(10, "-", 30)),
    new core.Variable(core.Type.INT, "result", -20),
  ],
  [
    "folds result of cmp instruction on two integers",
    new core.Variable(core.Type.INT, "result", new core.BinaryExpression(10, "==", 30)),
    new core.Variable(core.Type.INT, "result", false),
  ],
  [
    "folds result of add instruction on two strings",
    new core.Variable(
      core.Type.STRING,
      "result",
      new core.BinaryExpression("Hello and ", "+", "goodbye.")
    ),
    new core.Variable(core.Type.STRING, "result", "Hello and goodbye."),
  ],
  [
    "folds result of sub instruction on two strings",
    new core.Variable(
      core.Type.STRING,
      "result",
      new core.BinaryExpression(
        "The cats and the dogs went to the park.",
        "-",
        "cats and the "
      )
    ),
    new core.Variable(core.Type.STRING, "result", "The dogs went to the park."),
  ],
  [
    "folds result of cmp instruction on two strings",
    new core.Variable(
      core.Type.STRING,
      "result",
      new core.BinaryExpression(
        "The cats and the dogs went to the park.",
        "==",
        "The cats and the dogs went to the park."
      )
    ),
    new core.Variable(core.Type.STRING, "result", true),
  ],
  [
    "folds result of add instruction on two string variables",
    new core.Variable(
      core.Type.STRING,
      "result",
      new core.BinaryExpression(svar1, "+", svar2)
    ),
    new core.Variable(core.Type.STRING, "result", "Hello, World"),
  ],
  ["optimizes if-true", new core.IfStatement(true, suite1, suite2), suite1],
  ["optimizes if-false", new core.IfStatement(false, suite2, suite1), suite1],
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
  */
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})
