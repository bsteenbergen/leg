<img src="https://raw.githubusercontent.com/bsteenbergen/mum/main/docs/mum_logo.PNG" width="600" height="200"/>

# mum

In “The Philosophy of Ruby: A Conversation with Yukihiro Matsumoto, Part I”, the creator of the Ruby programming language says the following:

"Often people, especially computer engineers, focus on the machines. They think, 'By doing this, the machine will run faster. By doing this, the machine will run more effectively. By doing this, the machine will something something something.' They are focusing on machines. But in fact we need to focus on humans, on how humans care about doing programming or operating the application of the machines. We are the masters. They are the slaves."

Inspired by Matsumoto’s comments on writing programming languages for humans as opposed to for machines, our team sought to design a language that emphasizes readability, yet still allows users to construct programs quickly. Our language, “mum” (an adjective meaning “quiet” or “silent”), is designed to let users “do the most with the least”, meaning that it allows for efficient programming without the lack of readability inherent in languages that prioritize terse syntax.

mum is a general purpose programming language intended for beginner to intermediate programmers.

## Authors

- [Elena Martinez](https://github.com/elenasmartinez)
- [Brittany Steenbergen](https://github.com/bsteenbergen)
- [Kira Toal](https://github.com/kirakira0)
- [Halle Vogelpohl](https://github.com/hallegv)

# Features

- Static Typing
- Functions
- Built-In Data Structures
- Single and Multi-line Comments
- Flexible Loop Declarations
- Conditional Statements

# Types and Data Structures

mum's types and built-in data structures are similar to those of Python.

## Types

| JavaScript | mum  |
| ---------- | ---- |
| boolean    | bool |
| string     | str  |
| number     | num  |

## Data Structures

| JavaScript | mum  |
| ---------- | ---- |
| Array      | List |
| Set        | Set  |
| Object     | Map  |

# Operators and Comparators

## Arithmetic Operators

| JavaScript | mum       |
| ---------- | --------- |
| x = 2      | x = 2     |
| x + 2      | x + 2     |
| x - 2      | x - 2     |
| x \* 2     | x \* 2    |
| x / 2      | x / 2     |
| x % 2      | rem x / 2 |
| x \*\* 2   | x ^ 2     |

## Logical Operators

| Operation | JavaScript | mum    |
| --------- | ---------- | ------ | --- |
| AND       | &&         | &&     |
| OR        | `\|\|`     | `\|\|` |
| NOT       | !          | !      |
| NAND      |            | !&     |
| NOR       |            | !      |     |

## Comparators

| JavaScript | mum    |
| ---------- | ------ |
| x > 2      | x > 2  |
| x < 2      | x < 2  |
| x >= 2     | x >= 2 |
| x <= 2     | x <= 2 |
| x == 2     | x == 2 |
| x != 2     | x != 2 |

# Functions

mum function declarations require the following components:

- The "task" keyword to denote the use of a function
- The function name
- Function inputs
- Optionally, the user may return a value using the "yields keyword"
  - "yields" must be followed either by an expression, or an identifier, a colon, and a statement

### Void Functions

<table>
  <th>JavaScript</th><th>mum</th>
  <tr>
    <td>
      <pre style="margin-left: 0; width:100%">
function sayHi() {
  console.log(“Hi!”);
}
    </td>
    <td>
      <pre style="margin-left: 0; width:100%">
task sayHi():
  mumble("Hi!")
    </td>
  </tr>
</table>

### Non-Void Functions

<table>
  <th>JavScript</th><th>mum</th>
  <tr>
    <td>
      <pre style="margin-left: 0; width:100%">
function square(num) {
  returns num**2;
}
    </td>
    <td>
      <pre style="margin-left: 0; width:100%">
task square(num n) yields n^2
    </td>
  </tr>
</table>

### Non-Void Functions With Return Value in Method Signature

<table>
  <th>JavaScript</th><th>mum</th>
  <tr>
    <td>
      <pre style="margin-left: 0; width:100%">
function greet(name) {
  let greeting = "Hello, "
  let exclamations = ""
  for (let i = 0; i < len(name); i++) {
    exclamations += "!"
  }
  const fullGreeting = greeting + name + exclamations
  return fullGreeting
}
    </td>
    <td>
      <pre style="margin-left: 0; width:100%">
task greet(str name) yields fullGreeting:
  str greeting = "Hello, "
  str exclamations = ""
  iter = 0 loop iter += 1 until iter = len(name):
    exclamations += "!"
  str fullGreeting = greeting + name + exclamations 
    </td>
  </tr>
</table>

# Loops

mum loops can be declared in several different ways. Users may define an iterator, step logic, and a stopping condition to create a loop reminiscent of JavaScript for loops. The syntax is as follows:

[iterator definition] loop [step logic] until [stop condition]

For example:

<table>
  <tr>
    <td>
      <pre style="margin-left: 0; width:100%">
  num iter = 0 loop iter += 2 until iter == 10: 
    mumble("Hello!)
    </td>
  </tr>
</table>
  
If the user does not wish to use an iterator, they may build something more akin to a while loop by declaring a loop with the following syntax:

loop until [stop condition]

For example:

<table>
  <tr>
    <td>
      <pre style="margin-left: 0; width:100%">
  loop until !sunny: 
    rainyDays += 1
    </td>
  </tr>
</table>

# Comments

## Single Line Comments

<table>
<tr>
  <td>
    <pre style="margin-left: 0; width:100%">
  num dollarValue = 50.0 # Here's a single line comment!  
  </td>
</tr>
</table>
  
## Multi-Line Comments 
<table>
<tr>
  <td>
    <pre style="margin-left: 0; width:100%">
  task getAbsoluteValue(num n):
    #* 
    And here is a multi-line comment, for when you have a lot to say 
    but want to keep your code looking clean!
    *#
    if n >= 0:
        yield n
    else:
        yield -n 
    </td>
</tr>
</table>
