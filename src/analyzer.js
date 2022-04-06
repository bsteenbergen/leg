// SEMANTIC ANALYZER
import { Variable, Function, error } from "./core.js"

import * as stdlib from "./stdlib.js"

class Context {
  constructor({
    parent = null,
    functions = new Map(),
    locals = new Map(),
    inLoop = false,
    function: f = null,
  }) {
    Object.assign(this, { parent, functions, locals, inLoop, function: f })
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    // No shadowing! Prevent addition if id anywhere in scope chain! This is
    // a Carlos thing. Many other languages allow shadowing, and in these,
    // we would only have to check that name is not in this.locals
    if (this.sees(name)) error(`Identifier ${name} already declared`)
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name)
    if (entity) {
      return entity
    } else if (this.parent) {
      return this.parent.lookup(name)
    }
    error(`Identifier ${name} not declared`)
  }
  newChildContext(props) {
    return new Context({ ...this, parent: this, locals: new Map(), ...props })
  }
  analyze(node) {
    return this[node.constructor.name](node)
  }
  Program(p) {
    this.analyze(p.statements)
  }
  PrintStatement(d) {
    let argument = d.argument.lexeme
    // ...
  }
  VariableDeclaration(d) {
    let type = d.type.typeName.lexeme
    let name = d.name.lexeme
    let initilizer = d.initializer.lexeme

    // IDRK what to do here?
    /// Now I do -> create a var and add to locals!
  }

  FunctionDeclaration(d) {
    let funcName = d.funcName.lexeme // This still has the #. Should we keep it?
    let suite = d.statements
    let func = new Function(funcName, suite)
    // Make sure function has not already been declared.
    // console.log(this.functions)
    // console.log(funcName)
    // console.log(this.functions.has(funcName))

    if (this.functions.has(funcName)) {
      // console.log("ERROR --> FUNC ALREADY DEFINED ")
      error(`Function ${funcName} already declared.`)
    }
    // If it has not, add the function being created to the Context's functions.
    this.functions.set(funcName, func)
  }

  FunctionCall(d) {
    // console.log("in fun call")
    // console.log(this.functions)
    // Check to make sure function has already been declared.
    // console.log(this.locals)
  }

  Array(a) {
    a.forEach((e) => this.analyze(e))
  }
}

// -----------------------
// Validation Functions
// -----------------------

// FOR FUNCTION CALLS

export default function analyze(node) {
  const initialContext = new Context({})
  for (const [name, type] of Object.entries(stdlib.contents)) {
    initialContext.add(name, type)
  }
  initialContext.analyze(node)
  return node
}
