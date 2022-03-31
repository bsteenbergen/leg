// Core classes and objects
//
// This module defines classes for the AST nodes. Only the constructors are
// defined here. Semantic analysis methods, optimization methods, and code
// generation are handled by other modules. This keeps the compiler organized
// by phase.

import util from "util"

export class Program {
  constructor(statements) {
    this.statements = statements
  }
}

export class Suite {
  constructor(statements) {
    this.statements = statements
  }
}

export class PrintStatement {
  constructor(argument) {
    Object.assign(this, { argument })
  }
}

export class VariableDeclaration {
  // example: num n = 12
  constructor(varType, name, initializer) {
    Object.assign(this, { varType, name, initializer })
  }
}

export class Variable {
  // Generated when processing a variable declaration
  constructor(varType, name) {
    Object.assign(this, { varType, name })
  }
}

/*
 * we aren't sure if we need to do 'returnExp' or 'returnVar'
 * since we 'yield Exp'
 */
export class FunctionDeclaration {
  constructor(funName, params, returnExp, body) {
    Object.assign(this, { funName, params, returnExp, body })
  }
}

export class Param {
  constructor(name, type) {
    Object.assign(this, { name, type })
  }
}

export class ExpParens {
  constructor(exp) {
    Object.assign(this, { exp })
  }
}

// Assuming 'num' in
// "arr" "<" Type "," num ">"    --arrtype
// in mum.ohm means fixed len for arr
//export class MumArray {
// Example: ["Halle", "Brittany", "Kira", "Elena", "Ray"]
// constructor(elements) {
//  this.elements = elements
// }
//}

export class Type {
  // Type of all basic type int, float, string, etc. and superclass of others
  static NUM = new Type("num")

  constructor(description) {
    Object.assign(this, { description })
  }
}

export class Type_maptype extends Type {
  constructor(keyType, valueType) {
    super(`[${keyType.description}, ${valueType.description}]`)
    Object.assign(this, { keyType, valueType })
  }
}

// rename to ArrayType and update ast.js?

export class List {
  constructor(elements) {
    Object.assign(this, { elements })
  }
}

export class Dictionary {
  constructor(expressions) {
    this.expressions = expressions
  }
}

export class Binding {
  constructor(key, value) {
    Object.assign(this, { key, value })
  }
}

export class Assign {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}
export class IfShort {
  constructor(tests, consequent) {
    Object.assign(this, { tests, consequent })
  }
}

export class IfLong {
  constructor(tests, consequent, alternate) {
    Object.assign(this, { tests, consequent, alternate })
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class BinaryExpression {
  constructor(left, op, right) {
    Object.assign(this, { left, op, right })
  }
}

export class Loop {
  constructor(initExp, body) {
    Object.assign(this, { initExp, body })
  }
}

export class Control {
  constructor(expression) {
    this.expression = expression
  }
}

// Token objects are wrappers around the Nodes produced by Ohm. We use
// them here just for simple things like numbers and identifiers. The
// Ohm node will go in the "source" property.
export class Token {
  constructor(category, source) {
    Object.assign(this, { category, source })
  }
  get lexeme() {
    // Ohm holds this for us, nice
    return this.source.contents
  }
  get description() {
    return this.source.contents
  }
}

// Throw an error message that takes advantage of Ohm's messaging
export function error(message, token) {
  //if (token) {
  //  throw new Error(`${token.source.getLineAndColumnMessage()}${message}`)
  //}
  throw new Error(message)
}

// Return a compact and pretty string representation of the node graph,
// taking care of cycles. Written here from scratch because the built-in
// inspect function, while nice, isn't nice enough. Defined properly in
// the root class prototype so that it automatically runs on console.log.
Program.prototype[util.inspect.custom] = function () {
  const tags = new Map()

  // Attach a unique integer tag to every node
  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return
    if (node.constructor === Token) {
      // Tokens are not tagged themselves, but their values might be
      tag(node?.value)
    } else {
      // Non-tokens are tagged
      tags.set(node, tags.size + 1)
      for (const child of Object.values(node)) {
        Array.isArray(child) ? child.forEach(tag) : tag(child)
      }
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`
      if (e?.constructor === Token) {
        return `(${e.category},"${e.lexeme}"${
          //   e.value ? "," + view(e.value) : ""
          ""
        })`
      }
      if (Array.isArray(e)) return `[${e.map(view)}]`
      return util.inspect(e)
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let type = node.constructor.name
      let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`)
      yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`
    }
  }

  tag(this)
  return [...lines()].join("\n")
}
