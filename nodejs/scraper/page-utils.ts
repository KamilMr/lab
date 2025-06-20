const path = require('path');
const puppeteer = require('puppeteer');
const { Page } = require('puppeteer');
const {cleanUrl} = require('./utils.ts');

const getScreenshot = async (page: typeof Page, url: string, screenShotDir: string) => {
  await page.screenshot({
    path: path.join(process.cwd(), screenShotDir, `${cleanUrl(url)}.png`),
  });
};

const launchBrowser = async (headless: boolean) => {
  return puppeteer.launch({
    headless,
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
};

module.exports = {
  getScreenshot,
  launchBrowser,
};