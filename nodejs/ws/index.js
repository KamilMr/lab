import express from 'express';
import path from 'path';
import {WebSocketServer} from 'ws';

const DISCONNECT = 'DISCONNECT';
const ID = 'ID';
const JOIN = 'JOIN';

// helpers
const ss = data => JSON.stringify(data);
const sp = data => JSON.parse(data.toString());

const app = express();
// middleware
app.use(express.static(path.join(process.cwd() + '/static')));

//server
const server = app.listen(3001);


const wss = new WebSocketServer({server});
const clients = [];
wss.on('connection', ws => {
  ws.onerror = (err) =>console.log(err);
  const idx = clients.length;
  console.log('Clients connected ' + idx);
  clients[idx] = ws;

  clients[idx].send(ss([ID, idx]));

  clients.forEach((item, index) => {
    if (index !== idx) {
      item.send(ss([JOIN, 'Joined ' + idx]));
    }
  });

  ws.on('message', data => {
    const [channel, index, d] = sp(data);
    console.log(sp(data))

    // CHAT
    clients.forEach((item, i) => {
      if (i !== index) {
        console.log(i)
        item.send(ss([channel, d]));
      }
    });

    if (channel === DISCONNECT) {
      clients.splice(index, 1);
    }
  });
});
