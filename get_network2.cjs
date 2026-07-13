const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://my.moneyfusion.net/6a4cad8644eafb83a0614894?name=Limak&customerEmail=limak@example.com&phone=01020304', {waitUntil: 'networkidle2'});
  
  const content = await page.content();
  console.log('Includes limak@example.com?', content.includes('limak@example.com'));
  console.log('Final URL:', page.url());
  await browser.close();
})();
