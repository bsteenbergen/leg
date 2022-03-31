import { Variable } from "./core.js"

/**************************
 *  VALIDATION FUNCTIONS  *
 *************************/

function check(condition, message, entity) {
  if (!condition) error(message, entity)
}

function checkType(e, types, expectation) {
  check(types.includes(e.type), `Expected ${expectation}`)
}

function checkNumeric(e) {
  checkType(e, [Type.NUM], "a number")
}

function checkIsAType(e) {
  check(e instanceof Type, "Type expected", e)
}

/***************************************
 *  ANALYSIS TAKES PLACE IN A CONTEXT  *
 **************************************/

class Context {
  constructor({
    parent = null,
    locals = new Map(),
    inLoop = false,
    function: f = null,
  }) {
    Object.assign(this, { parent, locals, inLoop, function: f })
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    // No shadowing allowed in mum.
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

  VariableDeclaration(d) {
    // d --> num n = 12
    this.analyze(d.initializer)
    d.name.value = new Variable(d.varType.lexeme, d.name.lexeme)
    // d.name.value.type = d.initializer.type
    d.varType = d.initializer.type // Make sure initilizer is type consistent w/ declaration
    this.add(d.name.lexeme, d.name.value)
  }
}
