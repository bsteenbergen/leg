// SEMANTIC ANALYZER
import {
  Variable,
  Function,
  error,
  Type,
  BinaryExpression,
  Token,
  Instruction,
  ArrayType,
  LegArray,
} from "./core.js"

import * as stdlib from "./stdlib.js"

/**
 * All semantic analysis takes place inside of a context. Leg is unique in that, in
 * an attempt to mimick assembly, we only have a single, global context.
 */

class Context {
  constructor({ parent = null, functions = new Map(), variables = new Map() }) {
    Object.assign(this, { parent, functions, variables })
  }
  add(name, entity) {
    // Do not allow shadowing.
    this.variables.set(name, entity)
  }
  lookup(name) {
    let entity = this.variables.get(name)
    if (entity !== undefined) return entity
    entity = this.parent?.lookup(name)
    if (entity === undefined || entity === null) {
      error(`${name} has not been initialized`)
    }
    return entity
  }
  analyze(node) {
    return this[node.constructor.name](node)
  }
  Program(p) {
    this.analyze(p.statements)
  }
  PrintStatement(d) {
    this.analyze(d.argument)
  }
  BinaryExpression(e) {
    this.analyze(e.left)
    this.analyze(e.right)
    // Validate operator and operand type compatibility.
    if (e.left.type === e.right.type) {
      // Numbers (int, float, bin)
      if (["int", "float", "bin"].includes(e.left.type)) {
        if (["+", "-", "*", "/", "^", "%"].includes(e.op))
          e.resultType = e.left.type // arithop
        else if (["<=", "<", "!=", "==", ">=", ">"].includes(e.op)) e.resultType = "bool" // relop
      }
      // Strings
      else if (e.left.type === "str") {
        if (["+"].includes(e.op)) e.resultType = "str"
        else if (["!=", "=="].includes(e.op)) e.resultType = "bool"
        else if (["-", "*", "/", "^", "%", "<=", "<", ">=", ">"].includes(e.op))
          error("Unsupported operation in BinaryExpression with two strings")
      }
      // Bools
      else if (e.left.type === "bool") {
        if (["!=", "=="].includes(e.op)) e.resultType = "bool"
        else if (["+", "-", "*", "/", "^", "%", "<=", "<", ">=", ">"].includes(e.op))
          error("Unsupported operation in BinaryExpression with two bools")
      }
    } else {
      error("Incompatible operands in binary expression")
    }
  }
  VariableDeclaration(d) {
    let v = new Variable()
    d.name = d.name.lexeme
    // Validate variable has not already been declared.
    if (this.variables.has(d.name)) error(`Variable ${d.name} already declared`)
    // Type checking unique for arrays ...
    if (d.initializer.constructor === LegArray) {
      d.type = d.type.typeName.baseType.typeName.lexeme
      d.initializer.contents.forEach((e) => this.analyze(e))
      let contentValues = []
      d.initializer.contents.forEach((e) => {
        // console.log(e)
        if (e.type !== d.type)
          error(`Array element ${e.value} does not match array type ${d.type}`)
        contentValues.push(e.value)
      })
      v = new Variable(d.type, contentValues)
      // ... and for binary expressions.
    } else if (d.initializer.constructor === BinaryExpression) {
      this.analyze(d.initializer)
      d.type = d.type.typeName.lexeme
      if (d.initializer.resultType !== d.type)
        error("Variable type does not match result of BinaryExpression initializer")
    } else {
      d.type = d.type.typeName.lexeme
      this.analyze(d.initializer)
      // Validate initializer has correct type.
      if (d.type !== d.initializer.type)
        error(`Initializer type does not match variable type`)
      v = new Variable(d.type, d.initializer.value)
    }
    this.add(d.name, v)
    // console.log(this.variables)
  }
  VariableAssignment(d) {
    // Ensure LHS has already been initialized.
    let name = d.name.lexeme
    if (!this.variables.has(name)) {
      // If it has, throw!
      error(`Must initialize variables before assignment`)
    }
  }

  FunctionDeclaration(d) {
    let funcName = d.funcName.lexeme // This still has the #. Should we keep it?
    let suite = d.suite
    let func = new Function(funcName, suite)
    // Make sure function has not already been declared.
    if (this.functions.has(funcName)) {
      // If it has, throw!
      error(`Function ${funcName} already declared`)
    }
    // If it has not, add the function being created to the Context's functions.
    this.functions.set(funcName, func)
    // Create new child context
    // const childContext = this.newChildContext({
    //   functions: this.functions,
    //   variables: this.variables,
    //   function: func,
    // })
    // childContext.analyze(suite.statements)
  }

  FunctionCall(d) {
    // Is the call a branch or a branch link?
    let link = d.link.lexeme === "bl" ? true : false
    let funcName = d.funcName.lexeme
    // Make sure the function has been declared.
    if (!this.functions.has(funcName)) {
      // If it has, throw!
      error(`Function ${funcName} has not yet been declared`)
    }
    // Check if there is a condition being attatched to the function call.
    if (d.condition.length !== 0) {
      d.condition.forEach((c) => {
        // If we have a binary operator.
        if (c.left !== undefined && c.right !== undefined) {
          let be = new BinaryExpression(c.left, c.op, c.right)
        }
      })
    }
  }

  IfStatement(d) {
    // The condition must evaluate to a boolean.
    // If the condition is a token, make sure it is an id or a boolean.
    if (!["Id", "Bool", undefined].includes(d.condition.category)) {
      error(`If statement condition must evaluate to a boolean`)
    }
    // If the token is an id ...
    if (d.condition.category == "Id") {
      // ... make sure the variable has been declared ...
      if (!this.variables.has(d.condition.description)) {
        error(`Must initialize variables before use in conditional expression`)
      }
      // ... and make sure the var is of type bool ...
      const condition_type = this.variables.get(d.condition.description).type
      if (condition_type !== "bool") {
        error(`If statement condition must evaluate to a boolean`)
      }
    }
    // TODO: check for binary expressions
  }

  CompareInstruction(d) {
    this.ValidateInstructionParameterLength(d, 3)
    // If arg_1 already exists, make sure it's a boolean.
    if (this.variables.has(d.args[0].description)) {
      if (this.variables.get(d.args[0].description).type !== "bool") {
        error(`Result of comparison ${d.args[0].description} must be a boolean`)
      }
    }
    // Initializer just stores info about the params and the instruction type
    // since we won't know the result until runtime.
    let v = new Variable(
      "bool",
      d.args[0].description,
      new BinaryExpression(d.args[1], "===", d.args[2])
    )
    this.variables.set(d.args[0].description, v)
  }

  AddInstruction(d) {
    this.ValidateInstructionParameterLength(d, 3)
    // Check types of arguments
    let arg1Type = this.ValidateArithmeticInstructionArguments(d, Instruction.ADD)
    // Initializer just stores info about the params and the instruction type
    // since we won't know the result until runtime.
    let v = new Variable(
      arg1Type,
      d.args[0].description,
      new BinaryExpression(d.args[1], "+", d.args[2])
    )
    this.variables.set(d.args[0].description, v)
  }

  SubInstruction(d) {
    this.ValidateInstructionParameterLength(d, 3) // Check length of instruction
    let arg1Type = this.ValidateArithmeticInstructionArguments(d, Instruction.SUB)
    // Initializer just stores info about the params and the instruction type
    // since we won't know the result until runtime.
    let v = new Variable(
      arg1Type,
      d.args[0].description,
      new BinaryExpression(d.args[1], "-", d.args[2])
    )
    this.variables.set(d.args[0].description, v)
  }

  ValidateInstructionParameterLength(d, expectedLength) {
    if (d.args.length !== expectedLength) {
      error(`Instruction must have exactly ${expectedLength} arguments.`)
    }
    // If either arg_2 or arg_3 are variables, they must be initialized already.
    d.args.slice(1, expectedLength).forEach((arg) => {
      if (arg.category === "Id" && !this.variables.has(arg.description)) {
        error(`Variable ${arg.description} is undeclared`)
      }
    })
  }

  ValidateArithmeticInstructionArguments(d, instructionName) {
    // Set arg2 type.
    let arg2Type
    if (this.variables.has(d.args[1].description)) {
      arg2Type = this.variables.get(d.args[1].description).type
    } else if (d.args[1].constructor === Token) {
      arg2Type = d.args[1].category
    } else {
      arg2Type = d.args[1].constructor.name.toLowerCase()
    }
    // Set arg2 type.
    let arg3Type
    if (this.variables.has(d.args[2].description)) {
      arg3Type = this.variables.get(d.args[2].description).type
    } else if (d.args[2].constructor === Token) {
      arg3Type = d.args[2].category
    } else {
      arg3Type = d.args[2].constructor.name.toLowerCase()
    }
    // Types must be the same.
    if (arg2Type !== arg3Type) {
      error(`add instruction parameters must be the same type`)
    }
    // If arg_1 already exists, make sure it's the same type as arg_2 and arg_3.
    if (this.variables.has(d.args[0].description)) {
      if (this.variables.get(d.args[0].description).type !== arg2Type) {
        error(`Result of instruction must be same type as arguments.`)
      }
    }
    return arg2Type
  }

  Token(t) {
    // For ids being used, not defined
    if (t.category === "Id") {
      let v = this.lookup(t.lexeme)
      t.value = v.value
      t.type = v.type
    }
    if (t.category === "Int") [t.value, t.type] = [Number(t.lexeme), Type.INT.typeName]
    if (t.category === "Float")
      [t.value, t.type] = [Number(t.lexeme), Type.FLOAT.typeName]
    if (t.category === "Str") [t.value, t.type] = [t.lexeme, Type.STRING.typeName]
    if (t.category === "Bool")
      [t.value, t.type] = [t.lexeme === "true", Type.BOOL.typeName]
    if (t.category === "Bin") [t.value, t.type] = [t.lexeme, Type.BIN.typeName]
  }

  Array(a) {
    a.forEach((e) => this.analyze(e))
  }
}

// -----------------------
// Validation Functions
// -----------------------

export default function analyze(node) {
  const initialContext = new Context({})
  for (const [name, type] of Object.entries(stdlib.contents)) {
    initialContext.add(name, type)
  }
  initialContext.analyze(node)
  return node
}
