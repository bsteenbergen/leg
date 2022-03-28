import {
  VariableDeclaration,
  Type,
  FunctionDeclaration,
  List,
  // Function,
  Token,
  error,
} from "./core.js"
//import * as stdlib from "./stdlib.js"

/**********************************************
 *  TYPE EQUIVALENCE AND COMPATIBILITY RULES  *
 *********************************************/

Object.assign(Type.prototype, {
  // Equivalence: when are two types the same
  isEquivalentTo(target) {
    return this == target
  },
  // T1 assignable to T2 is when x:T1 can be assigned to y:T2. By default
  // this is only when two types are equivalent; however, for other kinds
  // of types there may be special rules. For example, in a language with
  // supertypes and subtypes, an object of a subtype would be assignable
  // to a variable constrained to a supertype.
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  },
})

// ....

/**************************
 *  VALIDATION FUNCTIONS  *
 *************************/

function checkBoolean(e) {
  checkType(e, [Type.BOOL], "a boolean")
}

function checkNumber(e) {
  checkType(e, [Type.NUM], "a number")
}

function checkIsAType(e) {
  check(e instanceof Type, "Type expected", e)
}

function checkList(e) {
  check(e.type.constructor === ListType, "List expected", e)
}

function checkHaveSameType(e1, e2) {
  check(e1.type.isEquivalentTo(e2.type), "Operands do not have the same type")
}

function checkAllHaveSameType(expressions) {
  check(
    expressions
      .slice(1)
      .every((e) => e.type.isEquivalentTo(expressions[0].type)),
    "Not all elements have the same type"
  )
}

// ....

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
  // ....
  // ...
  analyze(node) {
    return this[node.constructor.name](node)
  }
  Program(p) {
    this.analyze(p.statements)
  }
  VariableDeclaration(d) {
    this.analyze(d.initializer)
    d.variable.value = new Variable(
      d.variable.lexeme,
      d.modifier.lexeme === "const"
    )
    d.variable.value.type = d.initializer.type
    this.add(d.variable.lexeme, d.variable.value)
  }
  TypeDeclaration(d) {
    // Add early to allow recursion
    this.add(d.type.description, d.type)
    this.analyze(d.type.fields)
    checkFieldsAllDistinct(d.type.fields)
    checkNotRecursive(d.type)
  }
  FunctionDeclaration(d) {
    if (d.returnType) this.analyze(d.returnType)
    d.fun.value = new Function(
      d.fun.lexeme,
      d.parameters,
      d.returnType?.value ?? d.returnType ?? Type.VOID
    )
    checkIsAType(d.fun.value.returnType)
    // When entering a function body, we must reset the inLoop setting,
    // because it is possible to declare a function inside a loop!
    const childContext = this.newChildContext({
      inLoop: false,
      function: d.fun.value,
    })
    childContext.analyze(d.fun.value.parameters)
    d.fun.value.type = new FunctionType(
      d.fun.value.parameters.map((p) => p.type),
      d.fun.value.returnType
    )
    // Add before analyzing the body to allow recursion
    this.add(d.fun.lexeme, d.fun.value)
    childContext.analyze(d.body)
  }
  Parameter(p) {
    this.analyze(p.type)
    if (p.type instanceof Token) p.type = p.type.value
    checkIsAType(p.type)
    this.add(p.name.lexeme, p)
  }
  ListType(t) {
    this.analyze(t.baseType)
    if (t.baseType instanceof Token) t.baseType = t.baseType.value
  }
  FunctionType(t) {
    this.analyze(t.paramTypes)
    t.paramTypes = t.paramTypes.map((p) => (p instanceof Token ? p.value : p))
    this.analyze(t.returnType)
    if (t.returnType instanceof Token) t.returnType = t.returnType.value
  }
  Assignment(s) {
    this.analyze(s.source)
    this.analyze(s.target)
    checkAssignable(s.source, { toType: s.target.type })
    checkNotReadOnly(s.target)
  }
}

export default function analyze(node) {
  const initialContext = new Context({})
  for (const [name, type] of Object.entries(stdlib.contents)) {
    initialContext.add(name, type)
  }
  initialContext.analyze(node)
  return node
}
