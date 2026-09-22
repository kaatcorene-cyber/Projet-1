const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://payin.moneyfusion.net/payment/6a4cad8644eafb83a0614894/2000/Limak%20User/limakpayement@gmail.com', {waitUntil: 'networkidle2'});
  
  console.log('Final URL:', page.url());
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body:', text.substring(0, 500));
  await browser.close();
})();
