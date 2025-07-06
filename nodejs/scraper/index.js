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

const POOL_SIZE = 2;
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

const getAllLinksFromPage = async page => {
  const readLinks = () =>
    page.$$eval('a', as => as.map(a => a.href));

  try {
    return await readLinks();
  } catch (err) {
    const msg = err?.message || '';
    if (!msg.includes('Execution context was destroyed')) throw err;

    await page.waitForNavigation({timeout: 5000}).catch(() => {});
    return await readLinks();
  }
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

const hasLinkQueryParams = link => {
  return link.includes('?');
};

const scrapeAndSavePage = async (page, link) => {
  let html;
  try {
    html = await page.content();
  } catch (e) {
    await page.waitForNavigation({timeout: 5000}).catch(() => {});
    html = await page.content();
    // await getScreenshot(page, link, screenShotDir);
  }
  await writeFile(path.join(scrapedDir, `${cleanUrl(link)}.html`), html);
};

const isLinkValid = (link, depth, maxDepth, page) => {
  const tR = {
    isValid: true,
    message: '',
  };
  const retR = () => {
    if (!tR.isValid) log(`[isLinkValid] [PAGE-${page.pageId}] ${tR.message}`);
    return tR;
  };
  if (!link) {
    tR.isValid = false;
    tR.message = 'It is empty';
    return retR();
  }

  if (depth > maxDepth) {
    tR.isValid = false;
    tR.message = `Link ${link} at depth ${depth} is too deep ${depth} > ${maxDepth}`;
    return retR();
  }

  if (pageScraped.has(link)) {
    tR.isValid = false;
    tR.message = `Link ${link} at depth ${depth} has already been checked`;
    return retR();
  }

  if (!validateLink(link)) {
    tR.isValid = false;
    tR.message = `Link ${link} at depth ${depth} is not a valid link`;
    return retR();
  }

  if (!isSameOrigin(link, mainPage)) {
    tR.isValid = false;
    tR.message = `Link ${link} at depth ${depth} is not on the same origin`;
    return retR();
  }

  if (hasLinkQueryParams(link)) {
    tR.isValid = false;
    tR.message = `Link ${link} at depth ${depth} has query params`;
    return retR();
  }

  return retR();
};

const getPage = async browser => {
  if (pool.length && activePages < POOL_SIZE) {
    ++activePages;
    const page = pool.pop();
    return page;
  }

  if (activePages < POOL_SIZE) {
    ++activePages;
    const cookies = await readFile(cookiesPath, 'utf8');
    const savedCookies = JSON.parse(cookies);
    const page = await browser.newPage();

    // Add unique identifier to the page
    page.pageId = ++pageIdCounter;

    await page.setCookie(...savedCookies);
    return page;
  }

  return await new Promise(res => {
    waiters.push(res);
  });
}

const releasePage = page => {
  pool.push(page); // mark idle
  --activePages;

  if (waiters.length && pool.length) {
    ++activePages;
    const waiter = waiters.shift();
    const availablePage = pool.pop();
    waiter(availablePage); // wake one waiter
  }
};

const crawlLinks = async (browser, link, depth, maxDepth, cb) => {
  const page = await getPage(browser);

  try {
    const {finalUrl, redirected} = await goAndWait(page, link);
    if (redirected) {
      // return;            // don't scrape or recurse further
    }
    link = finalUrl;
    if (!(await isFileExists(path.join(scrapedDir, `${cleanUrl(link)}.html`)))) {
      await scrapeAndSavePage(page, link);
    }

    pageScraped.add(link);

    if (depth === maxDepth) {
      return; // reached leaf level
    }

    const links = await getAllLinksFromPage(page);

    const filtered = links.filter(l => isLinkValid(l, depth + 1, maxDepth, page));

    if (filtered.length > 0) {
      const newTasks = filtered.map(l =>
        crawlLinks(browser, l, depth + 1, maxDepth, ()=>{}),
      );
      releasePage(page);
      await Promise.all(newTasks);
    }
  } catch (e) {
    console.error(
      `[crawlLinks] [PAGE-${page.pageId}] Error processing ${link}:`,
      e,
    );
  } finally {
    // Only release if we haven't already released it early
    if (pool.indexOf(page) === -1) {
      releasePage(page);
    }

    if (waiters.length === 0 && pool.length > 0) {
      cb(depth);
    }
  }
};

const main = async ({username, password, depth = 1}) => {
  console.time('start all')
  const {browser} = await getLoggedInPage(username, password);

  scrapedDir = path.join(SCRAPED_DIR, cleanUrl(mainPage));
  screenShotDir = path.join(scrapedDir, 'screenshots');

  if (!(await isFileExists(scrapedDir))) {
    await mkdir(screenShotDir, {recursive: true});
  }

  log(`[START] scraping ${mainPage} max depth: ${depth}`);
  await crawlLinks(browser, mainPage, 0, depth, (depth) => {
    log(`[END] scraping ${mainPage} at depth ${depth}`);
  });

  await browser.close();
  log(`[SUMMARY] scraped ${pageScraped.size} pages`);
  log(`[END] browser closed`);
  console.timeEnd('start all')
  const allLinks = Array.from(pageScraped);
  await writeFile(path.join(scrapedDir, 'summary.txt'), allLinks.join('\n'));
};

if (require.main === module) {
  main({
    username: process.env.USER_WEB,
    password: process.env.PASS_WEB,
    depth,
  }).catch(console.error);
}
