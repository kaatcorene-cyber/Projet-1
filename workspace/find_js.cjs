const http = require('https');

http.get('https://my.moneyfusion.net/6a07c1723e8ed1397e29e0da', (resp) => {
  let data = '';
  resp.on('data', chunk => data += chunk);
  resp.on('end', () => {
    const jsFiles = data.match(/src="([^"]+\.js)"/g);
    console.log(jsFiles);
  });
});
