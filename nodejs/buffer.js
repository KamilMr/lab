// Basic method
const buf1 = Buffer.alloc(10);
console.log(buf1);

const source = Buffer.from('ßBCD');
console.log('source', source)
const target = Buffer.alloc(2)
source.copy(target, 0, 2, 3)
console.log(target.toString())

// 1. From a string
const bufFromString = Buffer.from("hello world", "utf8");
console.log(bufFromString);
// -> <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
// This is the correct way to convert text into its binary representation.

// 2. From an array of byte values
const bufFromArray = Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f]);
console.log(bufFromArray);
// -> <Buffer 68 65 6c 6c 6f>
console.log(bufFromArray.toString("utf8"));
// -> "hello"

// 3. From another Buffer (creates a copy)
const bufCopy = Buffer.from(bufFromString);
bufCopy[0] = 0x78; // Change the 'h' to an 'x'
console.log(bufCopy.toString("utf8")); // -> "xello world"
console.log(bufFromString.toString("utf8")); // -> "hello world" (original is unchanged)

console.log(Uint8Array, bufCopy.readInt16BE(0), ArrayBuffer)

// =============================================================================
// Multi-byte Numbers & Endianness
// =============================================================================
// Most binary protocols involve multi-byte numbers: 16-bit integers, 32-bit floats, etc.
// Buffer has methods like buf.readInt16BE() and buf.writeInt16BE()
// BE = Big-Endian (byte order) - critical concept in binary data
// These methods let you read/write multi-byte numbers without manual bit-shifting
// Essential for parsing binary formats: JPEG headers, database wire protocols, etc.

// =============================================================================
// Practice Project Ideas
// =============================================================================

// 1. BMP Image Header Parser
//    Parse first 54 bytes of BMP: width, height, color depth
//    Uses: readUInt32LE(), readUInt16LE()
//
//    const fs = require('fs');
//    const buf = fs.readFileSync('image.bmp');
//    const width = buf.readUInt32LE(18);
//    const height = buf.readUInt32LE(22);
//    const bitsPerPixel = buf.readUInt16LE(28);

// 2. Simple Binary Message Protocol 
//    Encoder/decoder for: [1 byte type][2 bytes length][N bytes payload]

// 3. PNG Chunk Reader 
//    PNG structure: [4 bytes length BE][4 bytes type][data][4 bytes CRC]
//    Parse and list all chunks

// 4. WAV File Info Extractor
//    Read sample rate, channels, bit depth from 44-byte WAV header (little-endian)

// 5. Redis RESP Protocol Parser 
//    Parse Redis wire protocol - text delimiters + binary length-prefixed strings

// 6. UUID Generator 
//    Generate RFC 4122 v4 UUIDs using crypto.randomBytes() + Buffer manipulation
