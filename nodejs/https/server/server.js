const http = require('node:https');
const fs = require('fs');

const cred = {
    key: fs.readFile('key.pem', (err, data) => {
        if (err) {
            console.error(err);
        }
        return data;
    }),
    cert: fs.readFile('cert.pem', (err, data) => {
        if (err) {
            console.error(err);
        }
})
}

setImmediate(() => {console.log("Immediate here")}, 0);

// setTimeout with console log 1000ms
setTimeout(() => {console.log("hello")}, 0);