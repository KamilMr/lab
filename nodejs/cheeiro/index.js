const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

(async () => {
  const [filePath] = process.argv.slice(2); // Capture the file path from command-line arguments

  // Make sure the path starts with a '/' and is absolute
  const fullPath = `file://${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  console.log("Attempting to load file from:", fullPath); // This will show the path being accessed

  const browser = await puppeteer.launch({ headless: false }); // Run in non-headless mode to see the browser
  const page = await browser.newPage();

  try {
    await page.goto(fullPath, { waitUntil: "networkidle0" });
    const html = await page.content();
    const $ = cheerio.load(html);

    // Extract content from the <body>
    // const bodyContent = $('body').text();
    // console.log('Body Content:', bodyContent.trim());

    // Extract content from all <div> elements
    // const divContent = $('div').map((i, el) => $(el).text()).get().join('\n');
    // console.log('Div Content:', divContent.trim());

    // Extract content from all <ul> elements
    // const ulContent = $('ul').map((i, el) => $(el).text()).get().join('\n');
    // console.log('UL Content:', ulContent.trim());

    //Extract content from all <h3> elements
    // const h3Content = $('h3').map((i, el) => $(el).text()).get().join('\n');
    // console.log('H3 Content:', h3Content.trim());

    const rest = $(
      "#wpzoom-premium-recipe-card > div.recipe-card-image > div",
    ).text();
    console.log(rest);

    const time = $(
      "#wpzoom-premium-recipe-card > div.recipe-card-details > div > div.detail-item.detail-item-2",
    ).text();

    const sklad = $(
      "#wpzoom-premium-recipe-card > div.recipe-card-ingredients",
    ).text();
    console.log(sklad);
  } catch (error) {
    console.error("Error loading the page:", error);
  }

  await browser.close();
})();
