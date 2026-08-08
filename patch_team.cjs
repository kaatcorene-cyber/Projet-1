const fs = require('fs');

let content = fs.readFileSync('src/pages/Team.tsx', 'utf8');

content = content.replace(
  '<p className="font-black text-sm">5%</p>',
  '<p className="font-black text-sm">3%</p>'
);

content = content.replace(
  '<p className="font-black text-sm">2.5%</p>',
  '<p className="font-black text-sm">2%</p>'
);

fs.writeFileSync('src/pages/Team.tsx', content);
