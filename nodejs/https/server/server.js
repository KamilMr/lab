const http = require('node:https');
const fs = require('fs');

const cred = {
    key: fs.readFileSync('test-private-key.pem'),
    cert: fs.readFileSync('cert.pem'),
}

const handler = (req, res) => {
    console.log('req', req);

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello there \n');
};

const server = http.createServer(cred, handler);

server.listen(443, () => {console.log('Listen on 443');
})