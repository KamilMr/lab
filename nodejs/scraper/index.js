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

const getLoggedInPage = async (username, password) => {
  const browser = await launchBrowser(HEADLESS);
  const page = await browser.newPage();
  // to be changed
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  );

  if (await isFileExists(cookiesPath)) {
    const savedCookies = JSON.parse(await readFile(cookiesPath, 'utf8'));
    await page.setCookie(...savedCookies);
  }

  // Check whether we are already logged-in by visiting any logged-in only page.
  if (loginURL) {
    await page.goto(loginURL, {waitUntil: 'networkidle2'});
    const hasLoginForm = await page.$('#user_login'); //TODO be smarter

  if (hasLoginForm) {
    // Need to log in.
    await page.type('#user_login', username, {delay: 20});
    await page.type('#user_pass', password, {delay: 20});
    await Promise.all([
      page.click('.tml-button'),
      page.waitForNavigation({waitUntil: 'networkidle2'}),
    ]);

    // Save fresh cookies for next time
    const freshCookies = await page.cookies();
    await writeFile(COOKIES_FILE, JSON.stringify(freshCookies, null, 2));
  }
  }

  return {browser, page};
};
const goAndWait = async (page, link) => {
  //TODO rethink
  try {
    const resp = await page.goto(link, {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });
    const finalUrl   = resp?.url() || link;
    const redirected = finalUrl !== link;

    // ensure the DOM is at least partially ready
    await page.waitForSelector('body', {timeout: 10000}).catch(() => {});

    return {finalUrl, redirected};
  } catch (e) {
    return {finalUrl: link, redirected: false};
  }
};
