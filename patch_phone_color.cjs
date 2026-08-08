const fs = require('fs');

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const target = `<span className="font-black text-slate-800 text-base tracking-wide">🆔 : {user?.phone}</span>`;
const replacement = `<span className="font-black text-slate-800 text-base tracking-wide">🆔 : <span className="text-emerald-600">{user?.phone}</span></span>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/Profile.tsx', content);
