const https = require('https');

const data = JSON.stringify({
       id: "6a07c1723e8ed1397e29e0da",
       montant: "2500",
       name: "Parfait loua",
       phone: "0140814162",
       customerEmail: "parfaitloua@gmail.com",
       countryCode: "+225"
});

const req = https.request('https://pay.moneyfusion.net/api/v2/links/init-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', d => body+=d);
  res.on('end', () => console.log(body));
});
req.write(data);
req.end();
