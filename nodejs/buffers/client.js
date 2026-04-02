const net = require("net");

const client = net.createConnection({ port: 3000 }, () => {
  console.log("Connected to server\n");

  // Send a small text message
  client.write("Hello from client!");
  console.log("Sent: small text message");

  // Send a larger chunk after a short delay
  setTimeout(() => {
    const bigMessage = "X".repeat(1000);
    client.write(bigMessage);
    console.log("Sent: 1000-byte message");
  }, 500);

  // Send multiple rapid chunks to show repeated allocations
  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      client.write(`Rapid message #${i}`);
    }
    console.log("Sent: 5 rapid messages");
  }, 1000);

  // Close after all sends
  setTimeout(() => {
    client.end();
    console.log("\nDisconnected");
  }, 1500);
});

client.on("error", (err) => console.error("Connection error:", err.message));
