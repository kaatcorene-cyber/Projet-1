import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('FAILED RESOURCE:', response.url(), response.status());
    }
  });
  
  await page.goto('http://127.0.0.1:3000/login');
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
