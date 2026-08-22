const https = require('https');

https.get('https://my.moneyfusion.net/_next/static/chunks/216f6edd6fa1449b.js', res => {
  let body = '';
  res.on('data', d => body+=d);
  res.on('end', () => {
    const i = body.indexOf('customerEmail');
    if (i !== -1) {
      console.log(body.substring(Math.max(0, i - 1500), i + 2500));
    }
  });
});
