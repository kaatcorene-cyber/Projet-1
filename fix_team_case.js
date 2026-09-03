import fs from 'fs';

let content = fs.readFileSync('src/pages/Team.tsx', 'utf8');

content = content.replace(
  /\.eq\('referred_by', user.referral_code\);/g,
  `.eq('referred_by', user.referral_code?.toUpperCase());`
);

fs.writeFileSync('src/pages/Team.tsx', content);
