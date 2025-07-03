const {Transform} = require('node:stream');

const searchString = /draft:/;
class FilterStream extends Transform{
  constructor(opt){
    super(opt)
    this.tail = '';
  }
  _transform(chunk, enc, cb) {
    this.tail += chunk.toString();
    cb();
  }
  _flush(cb) {
    const isThere = searchString.test(this.tail);
    if (!isThere) return this.push(this.tail);
    this.tail = '';
    cb();
  }
};

module.exports = FilterStream;
