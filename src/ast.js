import fs from "fs"
import { Suite } from "mocha"
import ohm from "ohm-js"
import { takeCoverage } from "v8"
import * as core from "./core.js"

const mumGrammar = ohm.grammar(fs.readFileSync("src/mum.ohm"))

const astBuilder = mumGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new core.Program(body.ast())
  },
  Print(_print, expression) {
    return new core.PrintStatement(expression.ast())
  },
  VarDecl(type, id, _eq, initializer) {
    return new core.VariableDeclaration(
      type.sourceString,
      id.sourceString,
      initializer.ast()
    )
  },
  FunDecl(_task, id, _open, params, _close, yieldExp, suite) {
    return new core.FunctionDeclaration(
      id.ast(),
      params.asIteration().ast(),
      yieldExp.ast(),
      suite.ast()
    )
  },
  List(_open, params, _close) {
    return new core.List(params.asIteration().ast())
  },
  Array(_open, params, _close) {
    return new core.Array(params.asIteration().ast())
  },
  Map(_open, bindings, _closed) {
    return new core.Map(bindings.asIteration().ast())
  },
  Binding(exp1, _arrow, exp2) {
    return new core.Binding(exp1.ast(), exp2.ast())
  },
  Loop(_loop, control, _colon, suite) {
    return new core.Loop(control.ast(), suite.ast())
  },
  Control(_until, exp) {
    return new core.Control(exp.ast())
  },
  If_long(_if, test, consequent, _else, alternate) {
    return new core.IfLong(test.ast(), consequent.ast(), alternate.ast())
  },
  If_short(_if, test, consequent) {
    return new core.IfShort(test.ast(), consequent.ast())
  },
  Suite(body, _end) {
    return new core.Suite(body.ast())
  },
  Param(type, id) {
    return new core.Param(type.ast(), id.sourceString)
  },
  Type_arrtype(_arr, _open, type, _comma, num, _close) {
    return new core.Type_arrtype(type.ast(), num.sourceString)
  },
  Keyword_maptype(_map, _open, type1, _comma, type2, _close) {
    return new core.Type_maptype(type1.ast(), type2.ast())
  },
  Exp_or(op, left, right) {
    return new core.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp_and(op, left, right) {
    return new core.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp0_binary(op, left, right) {
    return new core.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp1_binary(op, left, right) {
    return new core.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp1_beforeexp() {},
  Exp2_binary(op, left, right) {
    return new core.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp3_binary(op, left, right) {
    return new core.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp3_modulo(op, left, right) {
    return new core.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp4_binary(op, left, right) {
    return new core.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp5_call(id, _open, expList, _close) {
    return new core.Call(id.ast(), expList.asIteration.ast())
  },
  Exp5_parens(_open, exp, _closed) {
    return new core.ExpParens(exp.ast())
  },
})

export default function ast(sourceCode) {
  const match = mumGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return astBuilder(match).ast()
}
