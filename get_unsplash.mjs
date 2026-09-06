import https from 'https';
const req = https.get('https://html.duckduckgo.com/html/?q=site:unsplash.com+kiwi+fruit', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const matches = body.match(/https:\/\/unsplash\.com\/photos\/[a-zA-Z0-9_-]+/g);
    console.log(matches ? [...new Set(matches)] : 'No matches');
  });
});
req.on('error', console.error);
