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
import { takeCoverage } from "v8"
import * as core from "./core.js"

const grammar = ohm.grammar(fs.readFileSync("src/mum.ohm"))

const astBuilder = grammar.createSemantics().addOperation("ast", {
  Program(statements) {
    return new core.Program(statements.ast())
  },
  Stmt_print(_print, argument) {
    return new core.PrintStatement(argument.ast())
  },
  Stmt_vardecl(typeName, id, _eq, initializer) {
    return new core.VariableDeclaration(
      typeName.ast(),
      id.ast(),
      initializer.ast()
    )
  },
  TypeName(typeName) {
    return new core.TypeName(typeName.ast())
  },
  id(_first, _rest) {
    return new core.Token("Id", this.source)
  },
  str(_openQuote, _chars, _closeQuote) {
    return new core.Token("Str", this.source)
  },
  int(_negative, _digits) {
    return new core.Token("Int", this.source)
  },
  float(_negative, _whole, _point, _fraction, _e, _sign, _exponent) {
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
