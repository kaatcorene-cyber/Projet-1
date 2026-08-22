const https = require('https');

https.get('https://my.moneyfusion.net/_next/static/chunks/216f6edd6fa1449b.js', res => {
  let body = '';
  res.on('data', d => body+=d);
  res.on('end', () => {
    // Find fetch or axios calls
    const m = body.match(/fetch\([^)]+\)|axios\.[a-z]+\([^)]+\)/g);
    if(m) console.log(m.slice(0, 50));
    
    // Check what happens on submit
    const apiCalls = body.match(/"\/api\/[^"]+"/g);
    if(apiCalls) console.log(apiCalls);
  });
});
