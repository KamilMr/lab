const {Transform} = require('node:stream');

const searchString = /draft:/;
let tail = '';

const filterStream = new Transform({
  defaultEncoding: 'utf-8',
  transform(chunk, enc, cb) {

    tail += chunk.toString();
    cb();
  },
  flush(cb) {
    const isThere = searchString.test(tail);
    if (!isThere) return this.push(tail);
    tail = '';
    cb();
  },
});

module.exports = filterStream
