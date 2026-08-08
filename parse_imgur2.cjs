const https = require('https');
https.get('https://imgur.com/a/EVYFGKj', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const jsonMatch = data.match(/window\.initialData\s*=\s*(\{.*?\});/);
    if (jsonMatch) {
       console.log("Found JSON!");
       const urls = jsonMatch[1].match(/[a-zA-Z0-9]{5,10}\.(jpg|jpeg|png)/g);
       console.log(urls ? [...new Set(urls)] : 'No urls inside');
    } else {
       console.log("No JSON found");
       // Try any image id pattern
       const any = data.match(/"hash":"([a-zA-Z0-9]{5,10})"/g);
       console.log(any);
    }
  });
});
