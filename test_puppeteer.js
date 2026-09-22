const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://my.moneyfusion.net/6a4cad8644eafb83a0614894');
  console.log('Page title:', await page.title());
  await browser.close();
})();
