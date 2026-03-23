// run node --expose-gc %
//
//ver 1
// const largeBuffer = Buffer.alloc(50 * 1024 * 1024);
// const views = [];
// for (let i = 0; i < 100000; i++) {
//   views.push(largeBuffer.slice(0, 10));
// }

// ver 2
const largeBuffer = Buffer.alloc(50 * 1024 * 1024);
const copies = [];
for (let i = 0; i < 100000; i++) {
  // Creating a copy for each item
  copies.push(Buffer.from(largeBuffer.slice(0, 10)));
}

global.gc(); // comment this out when running ver 1
console.log(process.memoryUsage())
