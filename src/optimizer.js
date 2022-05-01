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
    if (
      // Three parameter instruction on two Numbers.
      Array.isArray(v.value) &&
      v.value.length === 3 &&
      [v.value[0], v.value[2]].every((element) => {
        return element.constructor === Number
      })
    ) {
      switch (v.value[1]) {
        case "add":
          return new core.Variable(core.Type.INT, v.name, v.value[0] + v.value[2])
          break
        case "sub":
          return new core.Variable(core.Type.INT, v.name, v.value[0] - v.value[2])
          break
        default: // cmp
          return new core.Variable(core.Type.INT, v.name, v.value[0] === v.value[2])
      }
    }
  },
  BinaryExpression(e) {
    e.op = optimize(e.op)
    e.left = optimize(e.left)
    e.right = optimize(e.right)
    // Arithmetic operations and relational operators.
    if ([Number, BigInt].includes(e.left.constructor)) {
      if ([Number, BigInt].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right
        else if (e.op === "-") return e.left - e.right
        else if (e.op === "*") return e.left * e.right
        else if (e.op === "/") return e.left / e.right
        else if (e.op === "^") return e.left ** e.right
        else if (e.op === "<") return e.left < e.right
        else if (e.op === "<=") return e.left <= e.right
        else if (e.op === "==") return e.left === e.right
        else if (e.op === "!=") return e.left !== e.right
        else if (e.op === ">=") return e.left >= e.right
        else if (e.op === ">") return e.left > e.right
      } else if (e.left === 0 && e.op === "+") return e.right
      else if (e.left === 1 && e.op === "*") return e.right
      else if (e.left === 0 && e.op === "-") return new core.UnaryExpression("-", e.right)
      else if (e.left === 1 && e.op === "^") return 1
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0
    }
    // Now think about handling floats and other types

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
