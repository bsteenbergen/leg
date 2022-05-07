// AST GENERATOR
//
// Creates an Ohm semantics object to generate an AST. The AST node classes
// are defined in the core module.
//
// Invoke
//
//     ast(sourceCode)
//
// to return the root of the AST for the given source code string. The AST
// root is an instance of the class core.Program.

import { equal } from "assert"
import fs from "fs"
import { Suite } from "mocha"
import ohm from "ohm-js"
import { type } from "os"
import { takeCoverage } from "v8"
import * as core from "./core.js"

const grammar = ohm.grammar(fs.readFileSync("./src/leg.ohm"))

const astBuilder = grammar.createSemantics().addOperation("ast", {
  Program(statements) {
    return new core.Program(statements.ast())
  },
  Print(_print, argument) {
    return new core.PrintStatement(argument.ast())
  },
  VarDecl(_decl, type, varName, initializer) {
    return new core.VariableDeclaration(type.ast(), varName.ast(), initializer.ast())
  },
  VarAssign(_asgn, varName, initializer) {
    return new core.VariableAssignment(varName.ast(), initializer.ast())
  },
  FunDecl(funcName, _colon, suite) {
    return new core.FunctionDeclaration(funcName.ast(), suite.ast())
  },
  FunCall(link, funcName, condition) {
    return new core.FunctionCall(link.ast(), funcName.ast(), condition.ast())
  },
  IfStmt(_if, condition, _colon, suite, _else, _colon2, elseSuite) {
    return new core.IfStatement(condition.ast(), suite.ast(), elseSuite.ast())
  },
  Instruction_cmp(_cmp, args) {
    return new core.CompareInstruction(args.asIteration().ast())
  },
  Instruction_add(_add, args) {
    return new core.AddInstruction(args.asIteration().ast())
  },
  Instruction_sub(_sub, args) {
    return new core.SubInstruction(args.asIteration().ast())
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
  Exp1_unary(op, right) {
    return new core.UnaryExpression(op.sourceString, right.ast())
  },
  Exp2_binary(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp3_binary(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp3_modulo(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Exp4_binary(left, op, right) {
    return new core.BinaryExpression(left.ast(), op.sourceString, right.ast())
  },
  Suite(body, _end) {
    return new core.Suite(body.ast())
  },
  Type(typeName) {
    return new core.TypeName(typeName.ast())
  },
  LegArray(_open, contents, _close) {
    return new core.ArrayType(contents.asIteration().ast())
  },
  Type_arr(_open, base, _close) {
    return new core.ArrayType(base.ast())
  },
  id(_first, _rest) {
    return new core.Token("Id", this.source)
  },
  funcName(_hash, _id) {
    return new core.Token("Id", this.source)
  },
  binlit(_first, _b) {
    return new core.Token("Bin", this.source)
  },
  strlit(_openQuote, _chars, _closeQuote) {
    return new core.Token("Str", this.source)
  },
  boollit(_falsity) {
    return new core.Token("Bool", this.source)
  },
  intlit(_negative, _digits) {
    return new core.Token("Int", this.source)
  },
  floatlit(_negative, _whole, _point, _fraction, _e, _sign, _exponent) {
    return new core.Token("Float", this.source)
  },
  _terminal() {
    return new core.Token("Sym", this.source)
  },
  _iter(...children) {
    return children.map((child) => child.ast())
  },
})

export default function ast(sourceCode) {
  const match = grammar.match(sourceCode)
  if (!match.succeeded()) {
    core.error(match.message)
  }
  return astBuilder(match).ast()
}
