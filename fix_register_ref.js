import fs from 'fs';
let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

content = content.replace(
  /readOnly=\{true\}\n\s*className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 font-semibold cursor-not-allowed placeholder:text-slate-400 placeholder:font-normal"/m,
  `onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-orange-600 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal"`
);

content = content.replace(
  /placeholder="Rempli automatiquement via le lien"/m,
  `placeholder="Entrez le code d'invitation (facultatif)"`
);

fs.writeFileSync('src/pages/Register.tsx', content);
