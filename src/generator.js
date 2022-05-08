import { IfStatement, Type } from "./core.js"
import * as stdlib from "./stdlib.js"

export default function generate(program) {
  const output = []

  const standardFunctions = new Map([
    [stdlib.contents.print, (x) => `console.log(${x})`],
    // [stdlib.contents.sin, (x) => `Math.sin(${x})`],
    // [stdlib.contents.cos, (x) => `Math.cos(${x})`],
    // [stdlib.contents.exp, (x) => `Math.exp(${x})`],
    // [stdlib.contents.ln, (x) => `Math.log(${x})`],
    // [stdlib.contents.hypot, ([x, y]) => `Math.hypot(${x},${y})`],
    // [stdlib.contents.bytes, (s) => `[...Buffer.from(${s}, "utf8")]`],
    // [stdlib.contents.codepoints, (s) => `[...(${s})].map(s=>s.codePointAt(0))`],
  ])

  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name ?? entity.description}_${mapping.get(entity)}`
    }
  })(new Map())

  function gen(node) {
    return generators[node.constructor.name](node)
  }

  const generators = {
    Program(p) {
      gen(p.statements)
    },
    PrintStatement(e) {
      output.push(`console.log(${gen(e.argument)});`)
    },
    VariableDeclaration(d) {
      output.push(`let ${gen(d.name)} = ${gen(d.initializer)};`)
    },
    VariableAssignment(s) {
      output.push(`${gen(s.source)} = ${gen(s.target)};`)
    },
    FunctionDeclaration(d) {
      output.push(`function ${gen(d.funcName)}() {`) // no function args for now
      gen(d.suite)
      output.push("}")
    },
    Variable(v) {
      return targetName(v)
    },
    Function(f) {
      return targetName(f)
    },
    AddInstruction(a) {},
    Suite(s) {
      s.statements = gen(s.statements)
      return s
    },
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      if (s.alternate.constructor === IfStatement) {
        output.push("} else")
        gen(s.alternate)
      } else {
        output.push("} else {")
        gen(s.alternate)
        output.push("}")
      }
    },
    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==", "^": "**" }[e.op] ?? e.op
      return `(${gen(e.left)} ${op} ${gen(e.right)})`
    },
    UnaryExpression(e) {
      return `${e.op}(${gen(e.operand)})`
    },
    Number(e) {
      return e
    },
    BigInt(e) {
      return e
    },
    Boolean(e) {
      return e
    },
    String(e) {
      return e
    },
    Array(a) {
      return a.map(gen)
    },
  }

  gen(program)
  return output.join("\n")
}
