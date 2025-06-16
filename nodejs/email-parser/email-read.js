const fs = require('fs')
const {Mbox} = require('node-mbox')
const split = require('line-stream');

const [filePath] = process.argv.slice(2);

if (!filePath) {
    console.error('Please provide a file path as an argument');
    process.exit(1);
}

const mailbox = fs.createReadStream(filePath);
const splitter= split('\n');
const mbox = new Mbox({
    headers: true,
    encoding: 'utf-8',
    body: true,
    attachments: false,
    raw: false,
    rawBody: false,
    rawHeaders: false,
    rawAttachments: false,
})

mailbox.pipe(splitter).pipe(mbox);

mbox.on('message', msg => {
  console.log('Email:')
  console.log(msg.toString()) // You can parse headers/body here
})

mbox.on('data', data => {
    console.log(data.toString());

})

mbox.on('error', err => console.error('Error:', err))
mbox.on('end', () => console.log('Done reading mbox'))

