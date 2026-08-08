const fs = require('fs');

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const target = `        {/* Balance Card */}`;
const replacement = `        <div className="bg-white rounded-2xl p-3 flex justify-center items-center border border-slate-200 shadow-sm">
           <span className="font-black text-slate-800 text-base tracking-wide">🆔 : {user?.phone}</span>
        </div>

        {/* Balance Card */}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/Profile.tsx', content);
