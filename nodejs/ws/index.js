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
const clients = {};
wss.on('connection', ws => {
  ws.onerror = err => console.log(err);
  const newId = Math.max(...[...Object.keys(clients), 0]) + 1;
  console.log('Clients connected ' + newId);
  clients[newId] = ws;

  clients[newId].send(ss([ID, newId]));

  Object.keys(clients).forEach(clId => {
    if (+clId !== newId) {
      clients[clId].send(ss([JOIN, 'Joined ' + newId]));
    }
  });

  ws.on('message', data => {
    const [channel, id, d] = sp(data);

    // CHAT
    Object.keys(clients).forEach(clId => {
      if (+clId !== id) {
        clients[clId].send(ss([channel, d]));
      }
    });

    if (channel === DISCONNECT) {
      delete clients[id];
      console.log('Clients connected ' + Object.keys(clients).length);
    }
  });
});
