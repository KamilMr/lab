const {spawn}= require("child_process");
const pathToFfmpeg = require("ffmpeg-ffprobe-static");

const ffprobe = (path, args) => {
    const child = spawn(pathToFfmpeg.ffprobePath,  [path, ...args]);
    child.stdout.on("data", (data) => {
        console.log(data.toString());
    });
    child.stderr.on("data", (data) => {
        console.log(data.toString());
    });
};

ffprobe("./BigBuckBunny.mp4",
  [
    "-select_streams",
    "v",
    "-show_entries",
    "frame=pkt_size,pts_time",
    "-of",
    "json",
  ]);