<img src="https://raw.githubusercontent.com/bsteenbergen/mum/main/docs/leg_logo_1.jpeg" width="800" height="400"/>

# LEG

LEG is like assembly language, but better

## Background

Intended to mimic the notorious ARMSim#, our language, LEG, is a blend of assembly and JavaScript code for a fun time with assembly. Whether you know Assembly or JavaScript, you are guaranteed to enjoy working with it. Assembly can be tedious and frustrating, for those reasons we bring to you a new and improved assembly-esque language, taking the best of both worlds. Assembly language is for the purpose of creating human-readable code that is as close as possible to machine language. LEG will be similar in that sense because it is a higher level language intended to be close to assembly. Now break a LEG!

## Features

- FEATURE 1
- FEATURE 2
- FEATURE 3
- FEATURE 4
- FEATURE 5
- FEATURE 6

## Examples

Here are a few examples of LEG programs

### Printing

```
prt "Hello, World!"
```

### Combining Strings

```
str str_1 = "Hello, "
str sr_2 = "World!"

#combineStrings:
    add str_1 str_2 result
#

prt result
```

### Checking if Even

```
bool answer = false
int num = 10
#is_even:
    #if num % 2 == 0:
        answer = true
    #
#
```

### Checking if Palindrome

```
str to_check = "ABBA"
bool palidrome = true

#is_palidrome:
    int left = 0
    int right = len to_check - 1
    #loop:
        #if to_check[left] != to_check[right]:
            palidrome = false
            break all
        #
        left = left + 1
        right = right + 1
        b left >= right @ branch iff left >= right
    #
#
```

### Grade Checker

```
int percent = 87
#letter_grade:
    if percent >= 90:
        prt "You got an A, amazing job."
        break all
    if percent >= 80 and percent < 90:
        prt "You got an B, good job."
        break all
    if percent >= 70 and percent <80:
        prt "You got a C, try a little harder next time."
        break all
    if percent >= 60 and percent <70:
        prt "You got a D, good luck next time."
        break all
    else:
        prt "You failed."
#
```

### Squaring a Number

```

int result = -1
int number = 23
#square:
    result = number ^ 2
#
```
