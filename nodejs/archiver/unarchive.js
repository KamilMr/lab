import {createReadStream, createWriteStream} from 'fs';
import {pipeline} from 'stream';
import {createDecryptAndDecompress} from './utils.js';

const [, , password, source, iv] = process.argv;
const destination = './test';

const buff = Buffer.from(iv, 'hex');
pipeline(
  createReadStream(source),
  createDecryptAndDecompress(password, buff),
  createWriteStream(destination),
  err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    // console.log(`${destination} created with iv: ${iv.toString('hex')}`);
  },
);
