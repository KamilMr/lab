const http = require("node:http");

const PORT = 7022;

const server = http.createServer((req, res) => {
  console.log('Request recived');

  res.writeHead(200, { "content-type": "text/plain" }).end("Http server here");
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
