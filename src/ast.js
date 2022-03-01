import fs from "fs"
import { Suite } from "mocha"
import ohm from "ohm-js"
import * as core from "./core.js"

const mumGrammar = ohm.grammar(fs.readFileSync("src/mum.ohm"))

const astBuilder = mumGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new core.Program(body.ast())
  },
  Stmt_print(_mumble, argument) {},
  Stmt_vardec(type, id, _eq, initializer) {},
  List(_list, id, _eq, _left, ...) {},
  Map(...) {},
  Stmt_assignment(id, _eq, expression) {
    return new core.Assignment(id.ast(), expression.ast())
  },
  Stmt_fundec(_task, ) {},
  Stmt_loop(_loop, control, _colon, suite) {},
  Stmt_if(ifStmt, ...),
  Stmt_exp(exp) {},
  FunDecl(_task, ) {},
  Params() {},
  Param(type, id) {},
  Args(left, expressions, right) {},
  Suite(body, end) {},
  Control(_until, expression) {},
  IfStmnt() {},
  Type(type) {}, // ??????
  TypeLit(typelit) {},
  Map(_map, id, _eq, left, type, right) {},
  MapType(typelit, _arrow, typelit) {},
  List() {}, // ??????
  Keyword() {},
  Exp_or() {},
  Exp_and() {},
  Exp0_binary() {},
  Exp1_binary() {},
  Exp1_beforeexp() {},
  Exp2_binary() {},
  Exp3_binary() {},
  Exp3_modulo()  {},
  Exp4_binary() {},
  Exp5_call() {},
  Exp5_parens() {},
  num() {},
  id() {},
  str() {},
  bool() {},
  logicop() {},
  relop() {},
  space() {}
})

export default function ast(sourceCode) {
  const match = mumGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return astBuilder(match).ast()
}
