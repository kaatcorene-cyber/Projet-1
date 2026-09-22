const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://imgur.com/a/EVYFGKj', { waitUntil: 'networkidle0' });
  const imgUrls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => img.src);
  });
  console.log(imgUrls.join('\n'));
  const metaUrls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('meta[property="og:image"]')).map(meta => meta.content);
  });
  console.log('OG:', metaUrls.join('\n'));
  await browser.close();
})();
