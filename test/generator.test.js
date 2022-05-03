// import assert from "assert/strict"
// import ast from "../src/ast.js"
// import analyze from "../src/analyzer.js"
// import optimize from "../src/optimizer.js"
// import generate from "../src/generator.js"

// function dedent(s) {
//   return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
// }

// const fixtures = [
//   {
//     name: "small",
//     source: `
//       decl int x 3
//       decl int y 0
//       asgn y 5 ^ x
//       prt y
//     `,
//     expected: dedent`
//       let x_1 = 3;
//       let y_2 = 0;
//       y_2 = 5**x_1;
//       console.log(y_2);
//     `,
//   },
// ]

// describe("The code generator", () => {
//   for (const fixture of fixtures) {
//     it(`produces expected js output for the ${fixture.name} program`, () => {
//       const actual = generate(optimize(analyze(ast(fixture.source))))
//       assert.deepEqual(actual, fixture.expected)
//     })
//   }
// })
