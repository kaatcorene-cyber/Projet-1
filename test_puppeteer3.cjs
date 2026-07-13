const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.method() === 'POST') {
      console.log('POST request URL:', request.url());
      console.log('POST data:', request.postData());
    }
    request.continue();
  });
  page.on('response', response => {
    if ([301, 302, 307, 308].includes(response.status())) {
      console.log('Redirect:', response.status(), response.headers().location);
    }
  });

  await page.goto('https://my.moneyfusion.net/6a4cad8644eafb83a0614894', {waitUntil: 'networkidle2'});
  
  // Fill the form
  await page.type('input[name="name"]', 'Limak User');
  await page.type('input[name="customerEmail"]', 'limak@example.com');
  await page.type('input#phone', '01020304');
  
  // Submit
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({waitUntil: 'networkidle2'}).catch(e => console.log('nav error', e));
  
  console.log('Final URL:', page.url());
  await browser.close();
})();
