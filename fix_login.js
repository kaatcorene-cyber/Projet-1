import fs from 'fs';

const files = ['src/pages/Login.tsx', 'src/pages/Register.tsx'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Remplacer les classes qui créent la "carte" (glassmorphism)
  code = code.replace(/<div className="bg-white\/10 backdrop-blur-xl border border-white\/10 rounded-\[2rem\] p-8 shadow-2xl">/g, '<div className="w-full">');

  // Changer les couleurs emerald -> yellow
  code = code.replace(/emerald/g, 'yellow');
  
  // Améliorer l'apparence des inputs pour s'adapter à la disparition de la carte
  code = code.replace(/bg-slate-900\/50 border border-white\/5/g, 'bg-slate-800\/80 border border-white\/10');
  
  // Pour le bouton, mettre le texte en noir ou slate-900 (parce que le jaune est clair)
  code = code.replace(/text-white font-black py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-yellow-500\/25/g, 'text-slate-900 font-black py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-yellow-500/25');
  code = code.replace(/text-white font-black py-4 rounded-2xl mt-6 transition-all shadow-lg shadow-yellow-500\/25/g, 'text-slate-900 font-black py-4 rounded-2xl mt-6 transition-all shadow-lg shadow-yellow-500/25');

  fs.writeFileSync(file, code);
});
