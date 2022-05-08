import util from "util"

export class Program {
  /*  Example: 
      str x = "hi" @ var decl
      print x @ print statement
  */
  constructor(statements) {
    this.statements = statements
  }
}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

export class VariableDeclaration {
  constructor(type, name, initializer) {
    Object.assign(this, { type, name, initializer })
  }
}

export class VariableAssignment {
  constructor(name, initializer) {
    Object.assign(this, { name, initializer })
  }
}

export class Variable {
  // Generated when processing a variable declaration
  constructor(type, value) {
    Object.assign(this, { type, value })
  }
}

export class Function {
  // Generated when processing a function declaration
  constructor(funcName, suite) {
    Object.assign(this, { funcName, suite })
  }
}

export class FunctionDeclaration {
  constructor(funcName, suite) {
    Object.assign(this, { funcName, suite })
  }
}

export class FunctionCall {
  constructor(link, funcName, condition) {
    Object.assign(this, { link, funcName, condition })
  }
}

export class IfStatement {
  constructor(condition, suite, elseSuite) {
    Object.assign(this, { condition, suite, elseSuite })
  }
}

export class CompareInstruction {
  constructor(args) {
    Object.assign(this, { args })
  }
}

export class AddInstruction {
  constructor(args) {
    Object.assign(this, { args })
  }
}

export class SubInstruction {
  constructor(args) {
    Object.assign(this, { args })
  }
}

export class Suite {
  constructor(statements) {
    this.statements = statements
  }
}

export class Type {
  static INT = new Type("int")
  static FLOAT = new Type("float")
  static STRING = new Type("str")
  static BOOL = new Type("bool")
  static BIN = new Type("bin")
  constructor(typeName) {
    Object.assign(this, { typeName })
  }
}

export class ArrayType {
  constructor(baseType) {
    Object.assign(this, { baseType })
  }
}

export class LegArray {
  constructor(contents) {
    this.contents = contents
  }
}

export class Instruction {
  static ADD = new Instruction("add")
  static SUB = new Instruction("sub")
  static CMP = new Instruction("cmp")
}

export class TypeName {
  constructor(typeName) {
    this.typeName = typeName
  }
}

export class BinaryExpression {
  // Example: 3 & 22
  constructor(left, op, right) {
    Object.assign(this, { left, op, right })
  }
}

export class UnaryExpression {
  // Example: -55
  constructor(op, operand) {
    Object.assign(this, { op, operand })
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
  // if (token) {
  //   throw new Error(`${token.source.getLineAndColumnMessage()}${message}`)
  // }
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
        return `(${e.category},"${e.lexeme}"${e.value ? "," + view(e.value) : ""})`
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
