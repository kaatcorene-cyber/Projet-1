const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://imgur.com/a/EVYFGKj', { waitUntil: 'networkidle0' });
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const agree = btns.find(b => b.innerText.toLowerCase().includes('accept all'));
    if (agree) { agree.click(); return true; }
    return false;
  });
  await new Promise(r => setTimeout(r, 4000));
  
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src.includes('i.imgur.com'));
  });
  console.log("IMGS:", imgs);
  await browser.close();
})();
