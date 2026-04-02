// Source: https://www.thenodebook.com/buffers/fragmentation-and-challenges#buffer-reuse
const net = require("net");

// BETTER: A single, larger buffer is allocated once and reused.
const MAX_PACKET_SIZE = 65536; // 64KB
const reusableBuffer = Buffer.alloc(MAX_PACKET_SIZE);

const server = net.createServer((socket) => {
  console.log("Client connected");

  socket.on("data", (chunk) => {
    console.log(`\n--- Received chunk (${chunk.length} bytes) ---`);

    const framedPacketLength = chunk.length + 4;

    if (framedPacketLength > MAX_PACKET_SIZE) {
      console.error("Packet too large for reusable buffer!");
      return;
    }

    // No new allocation. Write the chunk length as a 4-byte header into the existing buffer at offset 0.
    reusableBuffer.writeUInt32BE(chunk.length, 0);
    console.log("Header (first 4 bytes):", reusableBuffer.subarray(0, 4));
    console.log("Header value (chunk length):", reusableBuffer.readUInt32BE(0));

    // No new allocation. Copy chunk data into the reusable buffer starting at position 4 (right after the header).
    chunk.copy(reusableBuffer, 4);

    // subarray() creates a lightweight view (pointer + offset + length) — no byte copying.
    const framedPacketView = reusableBuffer.subarray(0, framedPacketLength);

    console.log("Framed packet length:", framedPacketView.length, "(4 header + " + chunk.length + " data)");
    console.log("Framed packet (hex):", framedPacketView.toString("hex").slice(0, 80) + "...");
    console.log("Data content:", chunk.toString().slice(0, 200));

    // Simulate forwarding
    sendToNextService(framedPacketView);
  });

  socket.on("end", () => console.log("Client disconnected"));
  socket.on("error", (err) => console.error("Socket error:", err.message));
});

function sendToNextService(framedPacket) {
  console.log(`-> Forwarded ${framedPacket.length} bytes (would send to next service)`);
}

server.listen(3000, () => {
  console.log("Server listening on port 3000 (reusable buffer version)");
});
