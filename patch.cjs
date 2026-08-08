const fs = require('fs');

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

content = content.replace(
  '<div className="w-full h-[25dvh] min-h-[140px] relative z-10 shadow-sm rounded-b-[40px] overflow-hidden flex-shrink-0">',
  '<div className="w-full h-[40dvh] relative z-10 shadow-sm rounded-b-[40px] overflow-hidden flex-shrink-0">'
);

// Fallback in case of exact formatting issues
content = content.replace(/<p className="text-slate-500 mt-2 font-medium">Rejoignez ElevFinAi aujourd'hui.<\/p>/g, '');
content = content.replace(/Créer un compte,/g, 'Créer un compte');

fs.writeFileSync('src/pages/Register.tsx', content);
