import fs from 'fs';
let content = fs.readFileSync('src/pages/Products.tsx', 'utf8');

content = content.replace(
  /const now = new Date\(\)\.getTime\(\);\s*const lastPaid = new Date\(inv\.last_paid_at \|\| inv\.created_at\)\.getTime\(\);\s*const nextPay = lastPaid \+ \(24 \* 60 \* 60 \* 1000\);\s*\/\/\ 24 hours later/m,
  `const now = new Date().getTime();
      const startDate = new Date(inv.start_date || inv.created_at).getTime();
      const timeElapsed = Math.max(0, now - startDate);
      const daysElapsed = Math.floor(timeElapsed / (24 * 60 * 60 * 1000));
      const nextPay = startDate + (daysElapsed + 1) * (24 * 60 * 60 * 1000);`
);
fs.writeFileSync('src/pages/Products.tsx', content);
