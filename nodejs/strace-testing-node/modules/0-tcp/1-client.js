const net = require("net")
//wireshark/tcp
const connection = net.createConnection({"host": "example.com", "port": 80})//this does DNS
connection.on("connect", () => {
    console.log("handshake done, connected")
    console.log(connection.localAddress + " + " + connection.localPort);

    connection.write("GET / HTTP/1.1\nHost:www.example.com\n\n");
  })

 connection.on("data", (data) => console.log (data.toString()))
