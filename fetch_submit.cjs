const https = require('https');

https.get('https://my.moneyfusion.net/_next/static/chunks/216f6edd6fa1449b.js', res => {
  let body = '';
  res.on('data', d => body+=d);
  res.on('end', () => {
    // print out strings around that fetch
    const index = body.indexOf('method:"POST"');
    if (index !== -1) {
      console.log('--- FOUND fetch POST ---');
      console.log(body.substring(index - 200, index + 400));
    }
    const index2 = body.indexOf('/6a07c1723e8ed1397e29e0da');
    if (index2 !== -1) {
      console.log(body.substring(index2 - 200, index2 + 300));
    }
  });
});
