const {promisify} = require('util');
const fs = require('fs');

const appendFile = promisify(fs.appendFile);
const writeFile = promisify(fs.writeFile);

const appendToFile = async (path: string, data: string) => {
  await appendFile(path, data);
};

const validateLink = (link: string): boolean => {
  try {
    new URL(link);
    return true;
  } catch (e) {
    return false;
  }
};

const cleanUrl = (url: string): string => {
  return url
    .replace(/^https/, '')
    .replaceAll(/[:\/\\.,-]/g, '')
    .replaceAll('#', '');
};

export {validateLink, cleanUrl};
const log = async (msg: string) => await appendFile('log.txt', msg + '\n');
module.exports = {
  appendToFile,
  writeFile,
  log,
};
