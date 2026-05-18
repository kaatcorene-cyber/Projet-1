const https = require('https');

https.get('https://my.moneyfusion.net/6a07c1723e8ed1397e29e0da', res => {
  let body = '';
  res.on('data', d => body+=d);
  res.on('end', () => {
    const scripts = body.match(/"\/_next\/static\/chunks\/app\/[^"]+\.js"/g);
    if(scripts) console.log(scripts);
  });
});
