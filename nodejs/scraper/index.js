require('dotenv/config');

const path = require('path');
const {writeFile, mkdir, readFile} = require('node:fs/promises');
const {getScreenshot, launchBrowser} = require('./page-utils.ts');

const {
  validateLink,
  cleanUrl,
  isSameOrigin,
  isFileExists,
  log: logToFile,
} = require('./utils.ts');

const HEADLESS = true;
const SCRAPED_DIR = 'scraped-pages';
const COOKIES_FILE = 'cookies.json';
const LOG_DIR = 'logs';

const POOL_SIZE = 8;
const pool = [];
const waiters = [];
let activePages = 0;
let pageIdCounter = 0;

