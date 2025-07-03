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
    if (!isThere) {
      // iterate over lines and push them to the stream
      const lines = this.tail.split('\n');
      lines.forEach((line, index) => {
        if (index + 1 === lines.length) return this.push(line);
        this.push(line + '\n');
      });
    }
    this.tail = '';
    cb();
  }
};

module.exports = FilterStream;
