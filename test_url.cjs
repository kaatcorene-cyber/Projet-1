const https = require('https');

https.get('https://payin.moneyfusion.net/payment/6a0a72ca95a060327ff13c11/5000/Adela Mining', (res) => {
  console.log('Status code:', res.statusCode);
  let body = '';
  res.on('data', d => body+=d);
  res.on('end', () => console.log('Loaded:', body.substring(0, 100)));
});
