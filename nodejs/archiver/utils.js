import {createGzip, createGunzip} from 'zlib';
import {createCipheriv, createDecipheriv, scryptSync} from 'crypto';
import pumpify from 'pumpify';

const createKey = password => {
  return scryptSync(password, 'salt', 24);
};

export const createCompressAndEncrypt = (password, iv) => {
  const key = createKey(password);
  const combinedStream = pumpify(
    createGzip(),
    createCipheriv('aes192', key, iv),
  );
  combinedStream.iv = iv;

  return combinedStream;
};

export const createDecryptAndDecompress = (password, iv) => {
  const key = createKey(password);
  return pumpify(createDecipheriv('aes192', key, iv), createGunzip());
};
