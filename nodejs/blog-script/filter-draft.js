const {Transform} = require('node:stream');

const searchString = /draft:/;
let tail = '';

class FilterStream extends Transform{
  constructor(opt){
    super(opt)
  }
  _transform(chunk, enc, cb) {
    tail += chunk.toString();
    cb();
  }
  _flush(cb) {
    const isThere = searchString.test(tail);
    if (!isThere) return this.push(tail);
    tail = '';
    cb();
  }
};

module.exports = FilterStream;
