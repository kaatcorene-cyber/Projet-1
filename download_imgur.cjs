const puppeteer = require('puppeteer-core');
const fs = require('fs');
const https = require('https');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://imgur.com/a/iu8I0PT', { waitUntil: 'networkidle2' });
  const imgSrc = await page.evaluate(() => {
    const img = document.querySelector('.image-placeholder');
    return img ? img.src : (document.querySelector('img.image-placeholder') || document.querySelector('img')).src;
  });
  console.log('Found image URL:', imgSrc);
  
  if (imgSrc) {
    const viewSource = await page.goto(imgSrc);
    fs.writeFileSync('public/app_icon.png', await viewSource.buffer());
    console.log('Downloaded.');
  }
  await browser.close();
})();
