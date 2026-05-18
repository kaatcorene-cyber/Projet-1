const https = require('https');
const fs = require('fs');

async function check() {
  const chunks = ['f094e3e9541797f7', 'd4000e6c6ff7404e', 'e62a74346c9b9522', 'b009bc7101aafe92', '7416c03047c5aee7', '216f6edd6fa1449b'];
  for (let c of chunks) {
    await new Promise(r => {
      https.get(`https://my.moneyfusion.net/_next/static/chunks/${c}.js`, res => {
         let body = '';
         res.on('data', d => body+=d);
         res.on('end', () => {
           if(body.includes('/api/')) {
               console.log("FOUND API IN", c);
               const matches = body.match(/"([^"]*\/api\/[^"]*)"/g);
               if(matches) console.log(matches.slice(0, 10));
               
               const fetchMatches = body.match(/fetch\([^)]+\)/g);
               if(fetchMatches) console.log(fetchMatches.slice(0, 10));
           }
           r();
         });
      });
    });
  }
}
check();
