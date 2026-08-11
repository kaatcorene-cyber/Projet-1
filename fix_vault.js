import fs from 'fs';
let code = fs.readFileSync('src/pages/Vault.tsx', 'utf8');

code = code.replace(
  `        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">\n          <!-- \n            <img src="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400" alt="Coffre" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />\n            -->\n          </div>`,
  `        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">`
);

fs.writeFileSync('src/pages/Vault.tsx', code);
