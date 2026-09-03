import fs from 'fs';

let content = fs.readFileSync('src/pages/Team.tsx', 'utf8');

content = content.replace(
  /if \(!user\) return;/m,
  `if (!user || !user.referral_code) return;`
);

fs.writeFileSync('src/pages/Team.tsx', content);
