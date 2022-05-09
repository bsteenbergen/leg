export default function optimize(node) {
  return optimizers[node.constructor.name](node)
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },
  VariableDeclaration(d) {
    d.name = optimize(d.name)
    d.initializer = optimize(d.initializer)
    return d
  },
  VariableAssignment(s) {
    s.source = optimize(s.name)
    s.target = optimize(s.initializer)
    return s
  },
  FunctionDeclaration(d) {
    d.funcName = optimize(d.funcName)
    d.suite = optimize(d.suite)
    return d
  },
  Function(f) {
    return f
  },
  FunctionCall(c) {
    return c
  },
  Variable(v) {
    return v
  },
  IfStatement(s) {
    s.test = optimize(s.condition)
    s.consequent = optimize(s.suite)
    s.alternate = optimize(s.elseSuite)
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : s.alternate
    }
    return s
  },
  Suite(s) {
    s.statements = optimize(s.statements)
    return s
  },
  BinaryExpression(e) {
    e.op = optimize(e.op)
    e.left = optimize(e.left)
    e.right = optimize(e.right)
    if (e.op === "&&") {
      // Optimize boolean constants in && and ||
      if (e.left === true) return e.right
      else if (e.right === true) return e.left
    }
    if (e.op === "||") {
      if (e.left === false) return e.right
      else if (e.right === false) return e.left
    }
    // SHARED CASES ACROSS NUM, BIGINT, AND STRING.
    if (
      [Number, BigInt, String].includes(e.left.constructor) &&
      e.left.constructor === e.right.constructor
    ) {
      switch (e.op) {
        case "+":
          return e.left + e.right
        case "==":
          return e.left === e.right
        case "!=":
          return e.left !== e.right
        default:
          break
      }
    }
    // CASES APPLICABLE ONLY TO NUMBER AND BIGINT.
    if (
      [Number, BigInt].includes(e.left.constructor) &&
      e.left.constructor === e.right.constructor
    ) {
      if (e.op === "-") return e.left - e.right
      else if (e.op === "*") return e.left * e.right
      else if (e.op === "/") return e.left / e.right
      else if (e.op === "<") return e.left < e.right
      else if (e.op === "<=") return e.left <= e.right
      else if (e.op === ">") return e.left > e.right
      else if (e.op === ">=") return e.left >= e.right
      else if (e.op === "^") {
        if (e.right === 0) return 1
        else if (e.left === 1) return 1
        else return e.left ** e.right
      }
    }
    // CASES APPLICABLE ONLY TO STRING.
    if (e.left.constructor === e.right.constructor) {
      if (e.op === "-") return e.left.replace(e.right, "")
    }
    return e
  },
  UnaryExpression(e) {
    e.op = optimize(e.op)
    e.operand = optimize(e.operand)
    if (e.operand.constructor === Number) {
      if (e.op === "-") {
        return -e.operand
      }
    }
    return e
  },
  PrintStatement(e) {
    e.argument = optimize(e.argument)
    return e
  },
  CompareInstruction(i) {
    return i
  },
  AddInstruction(i) {
    return i
  },
  SubInstruction(i) {
    return i
  },
  Number(e) {
    return e
  },
  Boolean(e) {
    return e
  },
  String(e) {
    return e
  },
  Token(t) {
    // All tokens get optimized away and basically replace with either their
    // value (obtained by the analyzer for literals and ids) or simply with
    // lexeme (if a plain symbol like an operator)
    return t.value ?? t.lexeme
  },
  Array(a) {
    // Flatmap since each element can be an array
    return a.flatMap(optimize)
  },
}
