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
  AddInstruction(a) {
    console.log(a.args)
    // if (v.value.constructor === core.BinaryExpression) {
    //     const varValue = optimize(v.value)
    //     return new core.Variable(v.type, v.name, varValue)
    //   }
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
    console.log("optimizing suite")
    s.statements = optimize(s.statements)
    return s
  },
  BinaryExpression(e) {
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
        case "-":
          return e.left - e.right
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
          break
      }
    }
    // CASES APPLICABLE ONLY TO STRING.
    if (e.left.constructor === e.right.constructor) {
      switch (e.op) {
        case "-":
          return e.left.replace(e.right, "")
        default:
          break
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
  PrintStatement(e) {
    e.argument = optimize(e.argument)
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
