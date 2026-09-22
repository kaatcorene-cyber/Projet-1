import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Replace the container styling to remove the card background, padding, and border
content = content.replace(
  '<div className="bg-white/5 p-6 md:p-8 rounded-[32px] border border-white/10 shadow-xl space-y-10">',
  '<div className="space-y-10">'
);

fs.writeFileSync('src/pages/Home.tsx', content);
