import {WebSocketServer} from 'ws';

const wss = new WebSocketServer({port: 8080});
wss.on('connection', stream => {
  console.log('someone connected');
});
