const https = require('https');
https.get('https://imgur.com/a/EVYFGKj', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/https:\\?\/\\?\/i\.imgur\.com\\?\/([a-zA-Z0-9]+)\.(jpg|jpeg|png)/g);
    console.log(matches ? [...new Set(matches)] : 'No matches');
  });
});
