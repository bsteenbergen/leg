// SEMANTIC ANALYZER
import { Variable, Function, error, BinaryExpression, Token } from "./core.js"

import * as stdlib from "./stdlib.js"

class Context {
  constructor({ parent = null, functions = new Map(), variables = new Map() }) {
    Object.assign(this, { parent, functions, variables })
  }
  add(name, entity) {
    // Do not allow shadowing.
    this.variables.set(name, entity)
  }
  newChildContext(props) {
    return new Context({
      ...this,
      parent: this,
      variables: new Map(),
      ...props,
    })
  }
  analyze(node) {
    return this[node.constructor.name](node)
  }
  Program(p) {
    this.analyze(p.statements)
  }
  PrintStatement(d) {
    // If printing variable, check if it has been declared.
    if (d.argument.category === "Id" && !this.variables.has(d.argument.lexeme)) {
      error(`Print statement argument "${d.argument.lexeme}" is uninitialized.`)
    }
  }

  VariableDeclaration(d) {
    let type = d.type.typeName.lexeme
    let name = d.name.lexeme
    let initilizer = d.initializer.lexeme
    let v = new Variable(type, name, initilizer)
    // Make sure variable has not already been declared.
    if (this.variables.has(name)) {
      // If it has, throw!
      error(`Variable ${name} already declared`)
    }
    // Make sure variable is being initialized to the correct type.
    if (d.initializer.constructor === Token) {
      // If initialized to id, make sure id has been declared.
      if (d.initializer.category === "Id") {
        if (!this.variables.has(d.initializer.lexeme)) {
          error(`Initializer ${d.initializer.lexeme} has not been initalized.`)
        }
      }
      if (["Int", "Float", "Bool"].includes(d.initializer.category)) {
        if (d.initializer.category.toLowerCase() !== type.toLowerCase()) {
          error(`Initializer type does not match variable type`)
        }
      }
    }
    // If we initialize our variable to the result of a binary expression ...
    if (d.initializer.constructor === BinaryExpression) {
      // Ensure that the variable type is a bool (b/c the result of a binary
      // expression cannot be anything else.)
      if (type !== "bool") {
        error(
          `Variable ${name} is being initalized to result of binary expression but is not type bool`
        )
      }
    }
    this.variables.set(name, v)
  }
  VariableAssignment(d) {
    // Ensure LHS has already been initialized.
    let name = d.name.lexeme
    if (!this.variables.has(name)) {
      // If it has, throw!
      error(`Must initialize variables before asignment`)
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
    const childContext = this.newChildContext({
      functions: this.functions,
      variables: this.variables,
      function: func,
    })
    childContext.analyze(suite.statements)
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
    this.ValidateInstructionParameterLength(d, "cmp", 3)
    // If arg_1 already exists, make sure it's a boolean.
    if (this.variables.has(d.args[0].description)) {
      if (this.variables.get(d.args[0].description).type !== "bool") {
        error(`Result of comparison ${d.args[0].description} must be a boolean`)
      }
    }
    // Initializer just stores info about the params and the instruction type
    // since we won't know the result until runtime.
    let v = new Variable("bool", d.args[0].description, undefined)
    this.variables.set(d.args[0].description, v)
  }

  AddInstruction(d) {
    this.ValidateInstructionParameterLength(d, "add", 3)
    // Check types of arguments
    let arg1Type = this.ValidateArithmeticInstructionArguments(d, "add")
    // Initializer just stores info about the params and the instruction type
    // since we won't know the result until runtime.
    let v = new Variable(arg1Type, d.args[0].description, [d.args[1], "add", d.args[2]])
    this.variables.set(d.args[0].description, v)
  }

  SubInstruction(d) {
    this.ValidateInstructionParameterLength(d, "sub", 3) // Check length of instruction
    let arg1Type = this.ValidateArithmeticInstructionArguments(d, "sub")
    // Initializer just stores info about the params and the instruction type
    // since we won't know the result until runtime.
    let v = new Variable(arg1Type, d.args[0].description, [d.args[1], "sub", d.args[2]])
    this.variables.set(d.args[0].description, v)
  }

  ValidateInstructionParameterLength(d, instructionName, expectedLength) {
    if (d.args.length !== expectedLength) {
      error(
        `${instructionName} instruction must have exactly ${expectedLength} arguments.`
      )
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
        error(`Result of ${instructionName} instruction must be same type as arguments.`)
      }
    }
    return arg2Type
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
