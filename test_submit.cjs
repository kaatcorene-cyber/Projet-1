const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://my.moneyfusion.net/6a4cad8644eafb83a0614894', {waitUntil: 'networkidle2'});
  
  await page.type('input[name="montant"]', '2000');
  await page.type('input[name="name"]', 'Limak User');
  await page.type('input[name="customerEmail"]', 'limak@example.com');
  await page.type('input#phone', '01020304');
  
  await new Promise(r => setTimeout(r, 1000));
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({waitUntil: 'networkidle0'}).catch(e => console.log('Nav error:', e));
  console.log('FINAL URL:', page.url());
  await browser.close();
})();
