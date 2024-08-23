/*This is code from Nodejs design patterns book*/
import { fork } from "child_process";
import { connect } from "net";

// client
function multiplexChannels(sources, destination) {
  let openChannels = sources.length;
  for (let i = 0; i < sources.length; i++) {
    sources[i]
      .on("readable", function () {
        // ①
        let chunk;
        while ((chunk = this.read()) !== null) {
          const outBuff = Buffer.alloc(1 + 4 + chunk.length); // ②
          console.log(outBuff);
          outBuff.writeUInt8(i, 0);
          outBuff.writeUInt32BE(chunk.length, 1);
          chunk.copy(outBuff, 5);
          console.log(`Sending packet to channel: ${i}`);
          destination.write(outBuff); // ③
        }
      })
      .on("end", () => {
        // ④
        if (--openChannels === 0) {
          destination.end();
        }
      });
  }
}

const socket = connect(3000, () => {
  // ①
  const child = fork(
    // ②
    process.argv[2],
    process.argv.slice(3),
    { silent: true },
  );
  multiplexChannels([child.stdout, child.stderr], socket); // ③
});

// server
import { createWriteStream } from "fs";
import { createServer } from "net";

function demultiplexChannel(source, destinations) {
  let currentChannel = null;
  let currentLength = null;

  source
    .on("readable", () => {
      // ①
      let chunk;
      if (currentChannel === null) {
        // ②
        chunk = source.read(1);
        currentChannel = chunk && chunk.readUInt8(0);
      }

      if (currentLength === null) {
        // ③
        chunk = source.read(4);
        currentLength = chunk && chunk.readUInt32BE(0);
        if (currentLength === null) {
          return null;
        }
      }

      chunk = source.read(currentLength); // ④
      if (chunk === null) {
        return null;
      }

      console.log(`Received packet from: ${currentChannel}`);
      destinations[currentChannel].write(chunk); // ⑤
      currentChannel = null;
      currentLength = null;
    })
    .on("end", () => {
      // ⑥
      destinations.forEach((destination) => destination.end());
      console.log("Source channel closed");
    });
}

const server = createServer((socket) => {
  const stdoutStream = createWriteStream("stdout.log");
  const stderrStream = createWriteStream("stderr.log");
  demultiplexChannel(socket, [stdoutStream, stderrStream]);
});
server.listen(3000, () => console.log("Server started"));
