import fs from 'fs';
let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dashboard = dashboard.replace(
  /const maxInvest = Math\.max\(\.\.\.investments\.map\(i => Number\(i\.amount\) \|\| 0\)\);/g,
  "const maxInvest = Math.max(...investments.map(i => Number(i.plan_amount) || 0));"
);

fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);
console.log('Fixed VIP plan amount in Dashboard');
