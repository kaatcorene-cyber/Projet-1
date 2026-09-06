import https from 'https';

const urls = [
  'https://imgur.com/a/is3THCW',
  'https://imgur.com/a/KtjtZav',
  'https://imgur.com/a/HcluyH6',
  'https://imgur.com/a/HmsMVSu'
];

urls.forEach(url => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const match = data.match(/<meta property="og:image" content="(.*?)"/);
      if (match) {
        console.log(url, '->', match[1]);
      } else {
        console.log(url, '-> Not found');
      }
    });
  });
});
