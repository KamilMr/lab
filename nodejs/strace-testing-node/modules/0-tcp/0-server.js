const net = require("net")
console.log("Before server")
server = net.createServer(() => {})
console.log("Before Bind")
//this requires DNS which requires the event loop
server.listen(8080, "127.0.0.1");
server.on("listening", ()=> console.log("server created"))
server.on("connection", (connection) => {
    console.log(`new connection! ${connection.remotePort}` )
    connection.on("data", (data) => console.log(`got new data` + data.toString() ))
    })

console.log("After initial phase")
