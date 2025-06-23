const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const handleMessage = (msg, rinfo) => {
  console.log(`client got: ${msg} from ${rinfo.address}:${rinfo.port}`);
};

const handleError = (err) => {
  console.log(`client error: ${err}`);
};

const handleListening = () => {
  const address = client.address();
  console.log(`client listening ${address.address}:${address.port}`);
};

client.on('message', handleMessage);
// When we just send a message this automatically binds to a random port.
// otherwise we can't send anything
client.send("hello server", 3333, "127.0.0.1")

client.on("error", handleError);
client.on("listening", handleListening);

// However we can bind to a source port of our choosing, and for that uncomment the line below
//client.bind(55555)


// Below code is used if you would want to specify server and set it permanently
// client.connect( 3333,"127.0.0.1", () => {
  //notice that its called send and not write
  //because it is not a stream of bytes ..but an actual unit (message) we send
  // client.send("a whole message");
// });