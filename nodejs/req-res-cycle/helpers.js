const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'output.md');
const green = (s) => `\x1b[32m${s}\x1b[0m`;
let reqCounter = 0;

function initLogFile() {
  fs.writeFileSync(LOG_FILE, `# req-res-cycle lab output\n\n`);
}

function log(tag, msg) {
  const line = `[${tag}] ${msg}`;
  console.log(`[${green(tag)}] ${msg}`);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function section(title) {
  const sep = `\n---\n## ${title}\n`;
  console.log(green(sep));
  fs.appendFileSync(LOG_FILE, sep + '\n');
}

function snapshot(tag, req, res) {
  const state = {
    req: {
      complete: req.complete,
      destroyed: req.destroyed,
      readableEnded: req.readableEnded,
    },
    socket: {
      destroyed: req.socket?.destroyed,
    },
    res: {
      writableFinished: res.writableFinished,
      writableEnded: res.writableEnded,
      headersSent: res.headersSent,
    },
  };
  console.log(`[${green(tag)}]`);
  console.log(state);
  fs.appendFileSync(LOG_FILE, `[${tag}]\n\`\`\`json\n${JSON.stringify(state, null, 2)}\n\`\`\`\n`);
}

function nextReqId() {
  return ++reqCounter;
}

module.exports = { initLogFile, log, section, snapshot, nextReqId };
