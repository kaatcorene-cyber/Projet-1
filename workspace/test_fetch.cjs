const http = require('https');

http.get('https://my.moneyfusion.net/6a07c1723e8ed1397e29e0da', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    const lines = data.split('\n');
    const formLines = lines.filter(l => l.includes('<form') || l.includes('<input'));
    console.log(formLines.join('\n'));
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
