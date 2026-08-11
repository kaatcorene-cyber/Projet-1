import fs from 'fs';
let code = fs.readFileSync('src/pages/Vault.tsx', 'utf8');

code = code.replace(
  `        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">\n          <div className="w-32 h-32 mb-6 rounded-[2rem] overflow-hidden shadow-lg shadow-purple-500/10 border-4 border-white relative group">\n            <img src="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400" alt="Coffre" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />\n            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent"></div>\n          </div>`,
  `        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">`
);

fs.writeFileSync('src/pages/Vault.tsx', code);
