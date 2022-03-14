import { equal } from "assert"
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
  Print(_print, _open, expression, _close) {
    return new core.PrintStatement(expression.ast())
  },
  VarDecl(type, id, _eq, initializer) {
    return new core.VariableDeclaration(
      type.ast(),
      id.sourceString,
      initializer.ast()
    )
  },
  FunDecl(_task, id, _open, params, _close, _yields, yieldExp, _colons, suite) {
    return new core.FunctionDeclaration(
      id.ast(),
      params.asIteration().ast(),
      yieldExp.ast(),
      suite.ast()
    )
  },
  Assign(target, _eq, source) {
    return new core.Assign(target, source)
  },
  // List(_open, params, _close) {
  //  return new core.List(params.asIteration().ast())
  //},
  Array(_open, params, _close) {
    return new core.MumArray(params.asIteration().ast())
  },
  Map(_open, bindings, _closed) {
    return new core.Dictionary(bindings.asIteration().ast())
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
  If_long(_if, test, _colons, consequent, _else, alternate) {
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
  /** 
  Type_arrtype(_arr, _open, type, _comma, num, _close) {
    return new core.Type_arrtype(type.ast(), num.sourceString)
  },
  **/
  Type_maptype(_map, _open, type1, _comma, type2, _close) {
    return new core.Type_maptype(type1.ast(), type2.ast())
  },
  Exp_or(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp_and(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp0_binary(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp1_binary(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp2_binary(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp3_binary(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp3_modulo(_rem, left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp4_binary(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  //Exp5_call(id, _open, params, _close) {
    //return new core.Call(id.ast(), params.asIteration.ast())
  //},
  Exp5_parens(_open, exp, _closed) {
    return new core.ExpParens(exp.ast())
  },
  id(_first, _rest) {
    return new core.Token("Id", this.source)
  },
  true(_) {
    return new core.Token("Bool", this.source)
  },
  false(_) {
    return new core.Token("Bool", this.source)
  },
  num(_whole, _dot, _fraction) {
    return new core.Token("Int", this.source)
  },
  strlit(_openQuote, _chars, _closeQuote) {
    return new core.Token("Str", this.source)
  },
  _terminal() {
    return new core.Token("Sym", this.source)
  },
  _iter(...children) {
    return children.map((child) => child.ast())
  },
})

export default function ast(sourceCode) {
  const match = mumGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return astBuilder(match).ast()
}
