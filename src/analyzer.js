import { Variable, Type, FunctionType, ArrayType } from "./ast.js"
import * as stdlib from "./stdlib.js"

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage)
  }
}

const check = (self) => ({
  isNumber() {
    must(["num"].includes(self.type), `Expected a number`)
  },
  isBoolean() {
    must(self.type === "boolberry", `Expected a boolean`)
  },
  isInteger() {
    must(self.type === "intberry", `Expected an integer`)
  },
  isAType() {
    must(["intberry", "floatberry", "stringberry", "boolberry"].includes(self))
  },
  hasSameTypeAs(other) {
    if (typeof self.type === "string") {
      must(self.type === other.type, "Not same type")
    }
  },
  isAssignableTo(type) {
    if (typeof self.type === "string") {
      must(self.type === type, "Not assignable")
    }
  },
  isNotReadOnly() {
    must(!self.readOnly, `Cannot assign to constant ${self.name}`)
  },
  isInsideALoop() {
    must(self.inLoop, "Break can only appear in a loop")
  },
  isInsideAFunction(context) {
    must(self.function, "Return can only appear in a function")
  },
  isCallableFromCallee() {
    must(
      self.callee.type.constructor == FunctionType,
      "Call of non-function or non-constructor"
    )
  },
  returnsSomething() {
    must(self.type.returnType !== Type.VOID, "Cannot return a value here")
  },
  isReturnableFrom(f) {
    check(self).isAssignableTo(f.type.returnType)
  },
  match(parameters) {
    must(
      parameters.length === self.length,
      `${parameters.length} argument(s) required but ${self.length} passed`
    )
    parameters.forEach((p, i) => check(self[i]).isAssignableTo(p.type))
  },
  matchParametersOf(callee) {
    check(self).match(callee.parameters)
  },
})

class Context {
  constructor(parent = null, configuration = {}) {
    this.parent = parent
    this.locals = new Map()
    this.inLoop = configuration.inLoop ?? parent?.inLoop ?? false
    this.function = configuration.forFunction ?? parent?.function ?? null
  }
  sees(name) {
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    if (this.sees(name)) {
      throw new Error(`Identifier ${name} already declared`)
    }
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name)
    if (entity) {
      return entity
    } else if (this.parent) {
      return this.parent.lookup(name)
    }
    throw new Error(`Identifier ${name} not declared`)
  }
  newChild(configuration = {}) {
    return new Context(this, configuration)
  }
  analyze(node) {
    return this[node.constructor.name](node)
  }
  analyzeType(type) {
    if (typeof type === "string") {
      if (
        ["boolberry", "intberry", "stringberry", "floatberry"].includes(type)
      ) {
        return type
      }
    } else if (type.constructor === ArrayType) {
      type.baseType = this.analyzeType(type.baseType)
      return type
    } else {
      type.keyType = this.analyzeType(type.keyType)
      type.valueType = this.analyzeType(type.valueType)
      return type
    }
  }
  Program(p) {
    p.statements = this.analyze(p.statements)
    return p
  }
  Assignment(d) {
    d.name = this.analyze(d.name)
    d.variable = new Variable(d.name)
    d.type = this.analyzeType(d.type)
    d.variable.type = d.type
    this.add(d.variable.name, d.variable)
    if (
      d.type === "boolberry" ||
      d.type === "intberry" ||
      d.type === "floatberry" ||
      d.type === "stringberry"
    ) {
      d.source = this.analyze(d.source)
      check(d.variable).hasSameTypeAs(d.source)
    } else if (d.type["baseType"]) {
      d.source = d.source.literals
    } else {
      d.source = d.source.content
    }
    return d
  }
  Declaration(d) {
    d.name = this.analyze(d.name)
    d.variable = new Variable(d.name)
    d.type = this.analyzeType(d.type)
    d.variable.type = d.type
    this.add(d.variable.name, d.variable)
    return d
  }
  FuncDecl(d) {
    d.func.returnType = this.analyzeType(d.func.returnType)
    check(d.func.returnType).isAType()
    const childContext = this.newChild({ inLoop: false, forFunction: d.func })
    d.func.parameters = childContext.analyze(d.func.parameters)

    d.func.type = new FunctionType(
      d.func.parameters.map((p) => p.type),
      d.func.returnType
    )
    this.add(d.func.name, d.func)
    d.block = childContext.analyze(d.block)
    return d
  }

  Parameter(p) {
    p.id.name = this.analyze(p.id.name)
    p.variable = new Variable(p.id.name)
    p.type = this.analyzeType(p.type)
    p.variable.type = p.type
    this.add(p.variable.name, p.variable)
    return p
  }
  Increment(s) {
    s.identifier = this.analyze(s.identifier)
    check(s.identifier).isInteger()
    return s
  }
  Reassignment(s) {
    s.targets = this.lookup(s.targets.name)
    s.source = this.analyze(s.source)
    check(s.source).isAssignableTo(s.targets.type)
    check(s.targets).isNotReadOnly()
    return s
  }
  Block(b) {
    b.statements = this.analyze(b.statements)
    return b
  }
  Break(s) {
    check(this).isInsideALoop()
    return s
  }
  Return(s) {
    check(this).isInsideAFunction()
    check(this.function).returnsSomething()
    s.returnValue = this.analyze(s.returnValue)
    check(s.returnValue).isReturnableFrom(this.function)
    return s
  }
  Print(s) {
    s.argument = this.analyze(s.argument)
    return s
  }
  Conditional(s) {
    s.tests = this.analyze(s.tests)
    s.tests.forEach((s) => check(s).isBoolean())
    s.consequents = s.consequents.map((b) => this.newChild().analyze(b))
    s.alternates = s.alternates.map((b) => this.newChild().analyze(b))
    return s
  }
  WLoop(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()

    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  FLoop(s) {
    s.low = s.initializer.source.value
    s.high = s.test.expression2["value"]
    s.initializer = new Variable(s.initializer.name, true)
    s.initializer.type = "intberry"
    this.add(s.initializer.name, s.initializer)

    s.test = this.analyze(s.test)

    s.increment = this.analyze(s.increment)

    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  BinaryExpression(e) {
    e.expression1 = this.analyze(e.expression1)
    e.expression2 = this.analyze(e.expression2)

    if (["apple", "orange"].includes(e.op)) {
      check(e.expression1).isBoolean()
      check(e.expression2).isBoolean()
      e.type = "boolberry"
    } else if (
      ["plus", "minus", "times", "divby", "mod", "to the power of"].includes(
        e.op
      )
    ) {
      check(e.expression1).isNumeric()
      check(e.expression1).hasSameTypeAs(e.expression2)
      e.type = e.expression1.type
    } else if (["less", "less equals", "more", "more equals"].includes(e.op)) {
      check(e.expression1).isNumeric()
      check(e.expression1).hasSameTypeAs(e.expression2)
      e.type = "boolberry"
    } else if (["equals", "not equals"].includes(e.op)) {
      check(e.expression1).hasSameTypeAs(e.expression2)
      e.type = "boolberry"
    }
    return e
  }
  UnaryExpression(e) {
    e.expression = this.analyze(e.expression)
    if (e.op === "not") {
      check(e.expression).isBoolean()
      e.type = "boolberry"
    }
    return e
  }
  Call(c) {
    c.callee = this.analyze(c.callee)
    check(c).isCallableFromCallee()
    c.args = this.analyze(c.args)
    check(c.args).matchParametersOf(c.callee)
    c.type = c.callee.returnType
    return c
  }
  IdentifierExpression(e) {
    const variable = this.lookup(e.name)
    return variable
  }
  Literal(e) {
    if (Number.isInteger(e.value)) {
      e.type = "intberry"
    } else if (typeof e.value === "number") {
      e.type = "floatberry"
    } else if (typeof e.value === "string") {
      e.type = "stringberry"
    } else if (typeof e.value === "boolean") {
      e.type = "boolberry"
    }
    return e
  }
  String(e) {
    return e
  }
  Array(a) {
    return a.map((item) => this.analyze(item))
  }
  Arguments(a) {
    return a.argumentList.map((item) => this.analyze(item))
  }
}

export default function analyze(node) {
  Number.prototype.type = "floatberry"
  BigInt.prototype.type = "intberry"
  Boolean.prototype.type = "boolberry"
  String.prototype.type = "stringberry"
  Type.prototype.type = "typeberry"
  const initialContext = new Context()

  const library = { ...stdlib.types, ...stdlib.constants, ...stdlib.functions }
  for (const [name, type] of Object.entries(library)) {
    initialContext.add(name, type)
  }
  return initialContext.analyze(node)
}
