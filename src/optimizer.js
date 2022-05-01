import * as core from "./core.js"
import * as stdlib from "./stdlib.js"

export default function optimize(node) {
  return optimizers[node.constructor.name](node)
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },
  VariableDeclaration(d) {
    // console.log(d)
    // d.variable = optimize(d.variable) TODO: ASK WHY IS THIS NEEDED
    d.initializer = optimize(d.initializer)
    return d
  },
  VariableAssignment(s) {
    s.source = optimize(s.name)
    s.target = optimize(s.initializer)
    if (s.source === s.target) {
      return []
    }
    return s
  },
  Variable(v) {
    if (v.value.constructor === core.BinaryExpression) {
      const varValue = optimize(v.value)
      return new core.Variable(v.type, v.name, varValue)
    }
  },
  BinaryExpression(e) {
    // FOR SOME TYPES (LIKE NUMBER ADDING AND STRING CONCAT), HANDLING IS THE SAME
    // SO CONSIDER THE OUTER IF BE CHECKING OPERATOR
    // AND INNER IFS BE CHECKING TYPES
    e.op = optimize(e.op)
    e.left = optimize(e.left)
    e.right = optimize(e.right)

    // SHARED CASES ACROSS NUM, BIGINT, AND STRING.
    if (
      [Number, BigInt, String].includes(e.left.constructor) &&
      e.left.constructor === e.right.constructor
    ) {
      switch (e.op) {
        case "+":
          return e.left + e.right
        case "-":
          return e.left - e.right
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
      switch (e.op) {
        case "*":
          return e.left * e.right
        case "/":
          return e.left / e.right
        case "^":
          return e.left ** e.right
        case "<":
          return e.left < e.right
        case "<=":
          return e.left <= e.right
        case ">":
          return e.left > e.right
        case ">=":
          return e.left >= e.right
        default:
          return
      }
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
  BigInt(e) {
    return e
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
