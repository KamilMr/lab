const ffProbePackage = require("ffprobe");
const { spawn } = require("child_process");
const pathToFfmpeg = require("ffmpeg-ffprobe-static");

const TOLERANCE = 0.01;

const ffprobe = (path, args) => {
  let frames = 0,
    prev,
    first,
    last;
  const diffs = [];
  const child = spawn(pathToFfmpeg.ffprobePath, [path, ...args]);
  child.stdout.on("data", (buff) => {
    buff
      .toString()
      .split("\n")
      .forEach((line) => {
        if (!line) return;

        const f = Number.parseFloat(line);
        if (Number.isNaN(f)) throw new Error(`Invalid frame : ${line}`);
        if (first === undefined) first = f;
        else diffs.push(f - prev);

        prev = last = f;
        frames++;
      });
  });
  child.stderr.on("data", (data) => {
    // console.log("stderr", data.toString());
  });
  child.on("close", (code) => {
    if (code !== 0 || frames < 2) return console.error("ffprobe failed");

    const avg = (last - first) / (frames - 1);
    const fps = 1 / avg;
    const limit = avg * TOLERANCE;

    let lost = 0;
    diffs.forEach((d) => {
      if (d > limit) lost += Math.round(d * fps) - 1;
    });
    ffProbePackage(
      path,
      { path: pathToFfmpeg.ffprobePath },
      (err, metadata) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(metadata);
        console.log(
          `[${path}]: ≈${fps.toFixed(
            2
          )} fps, missing ${lost} frame(s), total ${frames} frames`
        );
      }
    );
  });
};

const [, , path] = process.argv;
if (!path) {
  console.error("Usage: node index.js <path>");
  process.exit(1);
}

ffprobe(path, [
  "-select_streams",
  "v",
  "-show_entries",
  "frame=pts_time",
  "-of",
  "csv=p=0",
]);

// const child = spawn(pathToFfmpeg.ffprobePath, [path])

// child.stdout.on("data", (buff) => {
//   console.log(buff.toString());
// });

// child.stderr.on("data", (buff) => {
//   console.log(buff.toString());
// });

// child.on("close", (code) => {
//   console.log("close", code);
// });
