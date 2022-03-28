// STANDARD LIBRARY
//
// Carlos comes with a lot of predefined entities. Some are constants, some
// are types, and some are functions. Each are defined in this module, and
// exported in a single object

import { Type, FunctionDeclaration } from "./core.js"

function makeFunction(name) {
  return Object.assign(new FunctionDeclaration(name))
}
export const contents = Object.freeze({
  num: Type.NUM,
  bool: Type.BOOL,
  string: Type.STRING,
  mumble: makeFunction("mumble", new FunctionDeclaration("mumble", [Type.ANY]))
  // probs need more but starting w this
})