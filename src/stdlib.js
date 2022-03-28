// STANDARD LIBRARY
//
// Carlos comes with a lot of predefined entities. Some are constants, some
// are types, and some are functions. Each are defined in this module, and
// exported in a single object

import { Type, FunctionDeclaration, List, Variable } from "./core.js"

// function declareConstant(type, variable) {
//   const var = makeConstant(variable.name)
//   return Object.assign(new VariableDeclaration(var.name, true), { type })
// }

function makeConstact(name) {
    return Object.assign(new Variable(name, true))
}

function makeFunction(name, type) {
  return Object.assign(new FunctionDeclaration(name), { type })
}
const numType = new List(Type.NUM)
// const stringToNumType = new FunctionDeclaration([Type.STRING], numType)

export const contents = Object.freeze({
  num: Type.NUM,
  bool: Type.BOOL,
  string: Type.STRING,
  // probs need more but starting w this
})