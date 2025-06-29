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

const [mainPage, depth = 1, loginURL] = process.argv.slice(2);

const log = logToFile(path.join(process.cwd(), LOG_DIR, `${cleanUrl(mainPage)}-log.txt`));

const cookiesPath = path.join(process.cwd(), COOKIES_FILE);

const pageScraped = new Set();

let scrapedDir = '';
let screenShotDir = '';
