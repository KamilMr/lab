const dgram = require('dgram')
const client = dgram.createSocket('udp4');

client.on('message', (msg, rinfo) => {
  console.log(`client got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

// if we want we can bind to a random port of our choice
client.bind(55555);

client.connect( 3333,"127.0.0.1", () => {
  console.log ("server exists .. send something.. ")
  // we are sending a whole message
  client.send("a whole message");
});

client.on("error", (err) => console.log(err) )
client.on('listening', () => {
  // this listens and keep reading the messages
  const address = client.address();
  console.log(`client listening ${address.address}:${address.port}`);
});
