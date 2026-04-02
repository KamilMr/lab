// Source: https://www.thenodebook.com/buffers/fragmentation-and-challenges#buffer-reuse
const net = require("net");

const server = net.createServer((socket) => {
  console.log("Client connected");

  socket.on("data", (chunk) => {
    console.log(`\n--- Received chunk (${chunk.length} bytes) ---`);

    // BAD: allocates two new buffers for every single data chunk
    const header = Buffer.alloc(4); // Allocate new memory for the header.
    header.writeUInt32BE(chunk.length, 0); // Write data length into the header at offset 0. Offset must be 0 because UInt32 needs 4 bytes (indices 0-3).
    console.log("Header buffer:", header); // It says <00 00 00 12>
    console.log("Header value (chunk length):", header.readUInt32BE(0));

    const framedPacket = Buffer.concat([header, chunk]); // Copies and joins them together. Bad because we allocate a new buffer on the heap every time.

    console.log("Framed packet length:", framedPacket.length, "(4 header + " + chunk.length + " data)");
    console.log("Framed packet (hex):", framedPacket.toString("hex").slice(0, 80) + "...");
    console.log("Data content:", chunk.toString().slice(0, 200));

    // Simulate forwarding
    sendToNextService(framedPacket);
  });

  socket.on("end", () => console.log("Client disconnected"));
  socket.on("error", (err) => console.error("Socket error:", err.message));
});

function sendToNextService(framedPacket) {
  console.log(`-> Forwarded ${framedPacket.length} bytes (would send to next service)`);
}

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
