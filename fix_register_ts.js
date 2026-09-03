import fs from 'fs';

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

content = content.replace(
  /referralCode: \(searchParams.get\('ref'\) && searchParams.get\('ref'\) !== 'undefined'\) \? searchParams.get\('ref'\) : ''/g,
  `referralCode: (searchParams.get('ref') && searchParams.get('ref') !== 'undefined') ? searchParams.get('ref') || '' : ''`
);

fs.writeFileSync('src/pages/Register.tsx', content);
