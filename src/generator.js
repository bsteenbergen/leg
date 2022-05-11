import { IfStatement, Type } from "./core.js"
import * as stdlib from "./stdlib.js"
export default function generate(program) {
  const output = []
  const standardFunctions = new Map([[stdlib.contents.print, (x) => `console.log(${x})`]])
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
      output.push(`function ${gen(d.funcName)}() {`)
      gen(d.suite)
      output.push("}")
    },
    AddInstruction(i) {
      // Concatenate strings
      if (i.args[1].category === "Str" && i.args[2].category === "Str") {
        let resName = i.args[0].source._contents
        let operand1 = i.args[1].source._contents.slice(1, -1)
        let operand2 = i.args[2].source._contents.slice(1, -1)
        output.push(`let ${resName} = "${gen(operand1 + operand2)}";`)
      }
    },
    // Variable(v) {
    //   console.log("variable")
    //   return targetName(v)
    // },
    // Function(f) {
    //   return targetName(f)
    // },
    // AddInstruction(a) {
    //   output.push(``)
    // },
    Suite(s) {
      s.statements = gen(s.statements)
      return s
    },
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      output.push("} else {")
      gen(s.alternate)
      output.push("}")
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
    // BigInt(e) {
    //   return e
    // },
    // do we need this?
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
