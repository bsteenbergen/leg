<img src="https://raw.githubusercontent.com/bsteenbergen/mum/main/docs/mum_logo.PNG" width="600" height="200"/>

## mum

In “The Philosophy of Ruby: A Conversation with Yukihiro Matsumoto, Part I”, the creator of the Ruby programming language says the following: 

"Often people, especially computer engineers, focus on the machines. They think, 'By doing this, the machine will run faster. By doing this, the machine will run more effectively. By doing this, the machine will something something something.' They are focusing on machines. But in fact we need to focus on humans, on how humans care about doing programming or operating the application of the machines. We are the masters. They are the slaves." 

Inspired by Matsumoto’s comments on writing programming languages for humans as opposed to for machines, our team sought to design a language that emphasizes readability, yet still allows users to construct programs quickly. Our language, “mum” (an adjective meaning “quiet” or “silent”), is designed to let users “do the most with the least”, meaning that it allows for efficient programming without the lack of readability inherent in languages that prioritize terse syntax. 

mum is a general purpose programming language intended for beginner to intermediate programmers.

# Authors 
- [Elena Martinez](https://github.com/elenasmartinez)
- [Brittany Steenbergen](https://github.com/bsteenbergen)
- [Kira Toal](https://github.com/kirakira0)
- [Halle Vogelpohl](https://github.com/hallegv)

## Features

- Dynamic Typing 
- Object-Oriented
- Functions 
- Built-In Data Structures 
- Single and Multi-line Comments 
- Flexible Loop Declarations 
- Conditional Statements 
- Built-In Exception Objects

## Types and Data Structures 

mum's types and built-in data structures are similar to those of Python.

# Types 

| Python      | mum               |
| ----------- | ----------------- |
| boolean     | bool              |
| string      | str               |
| number      | num               |

# Data Structures 

| Python      | mum               |
| ----------- | ----------------- |
| list        | list              |
| set         | set               |
| dictionary  | map               |


## Functions 

mum function declarations require the following components: 

- The "task" keyword to denote the use of a function 
- The function name 
- Function inputs 
- Optionally, the user may return a value using the "yields keyword" 
  - "yields" must be followed either by an expression, or an identifier, a colon, and a statement

### Void Functions

<table>
  <tr>Python</tr><tr>mum</tr>
  <tr>
    <td>
      <pre style="margin-left: 0; width:100%">
function sayHi():
  console.log(“Hi!”);
    </td>
    <td>
      <pre style="margin-left: 0; width:100%">
task sayHi():
	mumble("Hi!")
    </td>
  </tr>
</table>


## Classes and Objects 

- classes = templates, objects = ?


## Examples
