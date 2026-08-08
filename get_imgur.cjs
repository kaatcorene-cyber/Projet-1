const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://imgur.com/a/EVYFGKj', { waitUntil: 'networkidle0' });
  const content = await page.content();
  const match = content.match(/https:\/\/i\.imgur\.com\/[a-zA-Z0-9]{5,10}\.(jpg|jpeg|png)/g);
  console.log(match);
  await browser.close();
})();
