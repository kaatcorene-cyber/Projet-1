const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://payin.moneyfusion.net/payment/6a54b41f12fec21839891bb7/2000/Limak%20Pay', {waitUntil: 'networkidle2'});
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body:', text.substring(0, 500));
  await browser.close();
})();
