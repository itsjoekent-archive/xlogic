const diff = require('deep-diff');

console.log(diff({
  test: {
    hello: 'world',
  },
}, null));

// console.log(diff({
//   test: {
//     hello: 'world',
//   },
// }, {
//   test: null,
// }));
//
// console.log(diff({
//   test: {
//     hello: {
//       world: true,
//     },
//   },
// }, {
//   test: null,
// }));
//
// console.log(diff({
//   test: {
//     hello: {
//       world: true,
//     },
//   },
// }, {
//   test: {
//     world: null,
//   },
// }));
