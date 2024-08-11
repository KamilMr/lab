// Asynchronous sequential iteration using streams.
// Marge many files into one
import { createWriteStream, createReadStream } from "fs";
import { Readable, Transform } from "stream";

const concatFiles = (dest, files) => {
  return new Promise((resolve, reject) => {
    const destStream = createWriteStream(dest);
    Readable.from(files) // Create streams from the array of files, will emit path to file, operate in object mode
      .pipe(
        new Transform({
          // pipe it to transform stream
          objectMode: true,
          transform(filename, enc, done) {
            const src = createReadStream(filename); // we read from file
            src.pipe(destStream, { end: false }); // pipe data
            src.on("error", done);
            src.on("end", done); // when processing of given file is done so the next file is process then
          },
        }),
      )
      .on("error", reject)
      .on("finish", () => {
        // All files are processed.
        destStream.end(); // we end stream
        resolve(); // call callback function
      });
  });
};

export default concatFiles;
