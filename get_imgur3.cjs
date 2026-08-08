const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://imgur.com/a/EVYFGKj', { waitUntil: 'networkidle0' });
  const content = await page.content();
  console.log(content.match(/https:\/\/i\.imgur\.com\/[a-zA-Z0-9]{5,10}\.(jpg|jpeg|png)/g));
  console.log(content.match(/"url":"https:\/\/i\.imgur\.com\/[a-zA-Z0-9]{5,10}\.(jpg|jpeg|png)"/g));
  
  const imgUrls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => img.src);
  });
  console.log("ALL IMGS:", imgUrls.filter(url => !url.includes('favicon')));
  await browser.close();
})();
