const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://imgur.com/a/EVYFGKj', { waitUntil: 'networkidle0' });
  const text = await page.content();
  const match = text.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/);
  if (match) {
    const state = JSON.parse(match[1]);
    console.log(JSON.stringify(state).match(/https:\/\/i\.imgur\.com\/[a-zA-Z0-9]{5,10}\.(jpg|jpeg|png|mp4|gif)/g));
  } else {
    console.log("No initial state found.");
    // try to find any imgur link
    console.log(text.match(/https:\/\/i\.imgur\.com\/[a-zA-Z0-9]{5,10}\.(jpg|jpeg|png|mp4|gif)/g));
  }
  await browser.close();
})();
