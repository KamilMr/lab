const largeBuff = Buffer.alloc(1000*1024*1024); //1gb
const chunkSize = 1024;


console.time("copy creation");
const copy = Buffer.alloc(chunkSize);
largeBuff.copy(copy, 0, 5000, 5000 + chunkSize);
console.timeEnd("copy creation");

console.time("view creation");
const view = largeBuff.subarray(5000, 5000 + chunkSize)
console.timeEnd("view creation");

const buf = Buffer.from("hello");
console.log(buf instanceof Uint8Array); // true

const messageArrayBuffer = new ArrayBuffer(12); //
console.log(messageArrayBuffer)

// View 1: A Buffer to write a status string into the LAST 8 bytes.
const stringView1 = Buffer.from(messageArrayBuffer, 4, 8); //
stringView1.write("CONFIRMD"); //

// View 2: An Int32Array to read a 4-byte integer from the FIRST 4 bytes.
const intView1 = new Int32Array(messageArrayBuffer, 0, 1); //
console.log("Initial integer value:", intView1[0]); // 0

// Here comes the bug. We accidentally create the string view at offset 0.
const buggyStringView = Buffer.from(messageArrayBuffer, 0, 8); //

// We write a status update, thinking we're writing to the string part.
buggyStringView.write("CANCELED"); //
console.log("Corrupted integer value:", intView1.toString()); // 1128353859
