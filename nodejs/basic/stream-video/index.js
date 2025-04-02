const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3003;
const VIDEO_PATH = path.join(__dirname, 'video.mp4'); 

if (!fs.existsSync(VIDEO_PATH)) {
    console.error(`Video file not found: ${VIDEO_PATH}`);
    process.exit(1);
}

app.get('/video.mp4', (req, res) => {
    const stat = fs.statSync(VIDEO_PATH);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
        res.status(416).send('Requires Range header');
        return;
    }

    const CHUNK_SIZE = 1024 * 16 ; // Small chunks for lag simulation
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, fileSize - 1);
    
    const contentLength = end - start + 1;
    res.status(206).set({
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    });

    const stream = fs.createReadStream(VIDEO_PATH, {start, end});

    stream.on('data', chunk => {
        res.write(chunk);
        console.log(`Chunk ${start}-${end} sent (delayed)`);

        stream.pause(); // Pause streaming

        setTimeout(() => {
            stream.resume(); // Resume after delay
        }, 200); // 200ms delay per chunk
    });

    stream.on('end', () => res.end());
});

// ⚡ Normal Video (No Lag, With Seeking)
app.get('/video-normal.mp4', (req, res) => {
    const stat = fs.statSync(VIDEO_PATH);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
        res.status(200).set({
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        });
        fs.createReadStream(VIDEO_PATH).pipe(res);
        return;
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const contentLength = end - start + 1;

    res.status(206).set({
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    });

    fs.createReadStream(VIDEO_PATH, {start, end}).pipe(res);
});

app.listen(PORT, () => console.log(`Server running:
  - Laggy video (seeking enabled): http://localhost:${PORT}/video.mp4
  - Normal video: http://localhost:${PORT}/video-normal.mp4
`));
