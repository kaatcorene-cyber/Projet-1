const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.method() === 'POST') {
      console.log('REQUEST URL:', request.url());
      console.log('REQUEST POST DATA:', request.postData());
    }
    request.continue();
  });
  
  page.on('response', async response => {
    if (response.url().includes('api/v1') || response.url().includes('payin')) {
      console.log('RESPONSE URL:', response.url());
      console.log('RESPONSE STATUS:', response.status());
    }
  });

  await page.goto('https://my.moneyfusion.net/6a4cad8644eafb83a0614894?name=Limak&customerEmail=limak@example.com&phone=01020304', {waitUntil: 'networkidle2'});
  
  // wait for any network idle just in case
  await new Promise(r => setTimeout(r, 1000));
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({waitUntil: 'networkidle2'}).catch(e => console.log('nav error', e));
  console.log('FINAL URL:', page.url());
  await browser.close();
})();
