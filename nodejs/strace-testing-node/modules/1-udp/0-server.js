const dgram = require("dgram");
const server = dgram.createSocket("udp4");

const handleMessage = (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  //called send and not write, because it is a whole message
  server.send("hello client!", rinfo.port, rinfo.address);
};

const handleListen = () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
};

//event handlers
server.on("message", handleMessage);
server.on("listening", handleListen);

// Prints: server listening 0.0.0.0:3333
server.bind(3333);

