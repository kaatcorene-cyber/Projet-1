const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const regex = /<a href="https:\/\/t\.me[^>]*>[\s\S]*?<\/a>/;
code = code.replace(regex, "");

fs.writeFileSync('src/pages/Profile.tsx', code);
