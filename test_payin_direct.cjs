const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', request => request.continue());
  page.on('response', async response => {
    if (response.request().method() === 'POST' && response.url().includes('api.moneyfusion.net')) {
      console.log('POST URL:', response.url());
      console.log('POST RESP STATUS:', response.status());
      try {
        console.log('POST RESP BODY:', await response.text());
      } catch(e){}
    }
  });

  await page.goto('https://my.moneyfusion.net/6a4cad8644eafb83a0614894', {waitUntil: 'networkidle2'});
  
  await page.type('input[name="name"]', 'Limak User');
  await page.type('input[name="customerEmail"]', 'limak@example.com');
  await page.type('input#phone', '01020304');
  
  await new Promise(r => setTimeout(r, 1000));
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 3000));
  console.log('FINAL URL:', page.url());
  await browser.close();
})();
