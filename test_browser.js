import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:3000/login');
  await new Promise(r => setTimeout(r, 2000));
  
  const rect = await page.evaluate(() => {
    const img = document.querySelector('img');
    const form = document.querySelector('form');
    return {
      img: img ? img.getBoundingClientRect() : null,
      form: form ? form.getBoundingClientRect() : null,
    };
  });
  console.log(JSON.stringify(rect, null, 2));
  
  await browser.close();
})();
