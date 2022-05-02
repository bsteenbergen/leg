import { IfStatement, Type, StructType } from "./core.js"
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
    // Key idea: when generating an expression, just return the JS string; when
    // generating a statement, write lines of translated JS to the output array.
    Program(p) {
      gen(p.statements)
    },
    VariableDeclaration(d) {
      // We don't care about const vs. let in the generated code! The analyzer has
      // already checked that we never updated a const, so let is always fine.
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`)
    },
    VariableAssignment(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`)
    },
    Variable(v) {
      return targetName(v)
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
