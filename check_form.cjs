const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://my.moneyfusion.net/6a4cad8644eafb83a0614894', {waitUntil: 'networkidle2'});
  
  await page.type('input[name="name"]', 'Limak User');
  await page.type('input[name="customerEmail"]', 'limak@example.com');
  await page.type('input#phone', '01020304');
  
  const btnHTML = await page.evaluate(() => document.querySelector('button[type="submit"]').outerHTML);
  console.log('BTN HTML:', btnHTML);
  
  await browser.close();
})();
