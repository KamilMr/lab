const {appendFile, access} = require('node:fs/promises');

const isFileExists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch (e) {
    return false;
  }
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

const isSameOrigin = (link: string, mainPage: string): boolean => {
  try {
    const linkUrl = new URL(link);
    const mainPageUrl = new URL(mainPage);
    return linkUrl.origin === mainPageUrl.origin;
  } catch (e) {
    return false;
  }
};

const log = (path: string) => async (msg: string) =>
  await appendFile(path, msg + '\n');

module.exports = {
  cleanUrl,
  isFileExists,
  isSameOrigin,
  log,
  validateLink,
};
