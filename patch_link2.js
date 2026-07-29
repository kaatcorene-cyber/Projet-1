import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
content = content.replace(/const groupLink = config\?\.group_link \|\| 'https:\/\/t\.me\/\+_WVnzoKbc89jMDQ0';/, "const groupLink = 'https://t.me/+_WVnzoKbc89jMDQ0';");
// Also supportLink, if it falls back to groupLink, that's fine, but let's leave it.
fs.writeFileSync('src/pages/Dashboard.tsx', content);

let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
adminContent = adminContent.replace(/if \(!grp\) setGroupLink\('https:\/\/t\.me\/\+_WVnzoKbc89jMDQ0'\);/, "");
fs.writeFileSync('src/pages/Admin.tsx', adminContent);

console.log('hardcoded link');
