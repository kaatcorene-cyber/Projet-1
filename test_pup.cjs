const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://vbwmgiauoxuxouwowyml.supabase.com/rest/v1/', {waitUntil: 'networkidle2'}).catch(e => console.log('goto error:', e));
  console.log(await page.content());
  await browser.close();
})();
