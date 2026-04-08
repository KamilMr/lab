const express = require('express');
const { initLogFile, log, section, snapshot, nextReqId } = require('./helpers');

const app = express();
const PORT = 3099;

initLogFile();

app.use((req, res, next) => {
  const id = `#${nextReqId()} ${req.method} ${req.url}`;
  req._id = id;

  section(id);
  snapshot(`${id} → ARRIVE`, req, res);

  req.on('data', (chunk) => {
    log(`${id} req·data`, `received ${chunk.length} bytes`);
  });

  req.on('end', () => {
    log(`${id} req·end`, 'body fully consumed');
    snapshot(`${id} @ req·end`, req, res);
  });

  req.on('close', () => {
    log(`${id} req·close`, '★ REQUEST close');
    snapshot(`${id} @ req·close`, req, res);
  });

  req.on('error', (err) => {
    log(`${id} req·error`, err.message);
  });

  res.on('finish', () => {
    log(`${id} res·finish`, 'response done writing');
    snapshot(`${id} @ res·finish`, req, res);
  });

  res.on('close', () => {
    log(`${id} res·close`, '★ RESPONSE close');
    snapshot(`${id} @ res·close`, req, res);
  });

  next();
});

app.get('/slow', (req, res) => {
  log(req._id, '2s delay before response...');
  setTimeout(() => {
    if (req.socket.destroyed) {
      log(req._id, 'socket already destroyed, skipping response');
      return;
    }
    res.json({ ok: true, message: 'slow response done' });
  }, 2000);
});

app.listen(PORT, () => {
  console.log(`\n req-res-cycle lab running on http://localhost:${PORT}\n`);
});
