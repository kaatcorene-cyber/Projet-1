import puppeteer from 'puppeteer';
async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://imgur.com/a/4vcZalt', { waitUntil: 'networkidle2' });
  let img1 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => img.src);
  });
  console.log("Login Images:", img1);
  await browser.close();
}
run();
