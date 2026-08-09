const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const regexGroup = /<div>\s*<label className="block text-xs font-medium text-slate-500 ml-1 mb-1">Lien du Groupe[\s\S]*?<\/div>/;
const regexSupport = /<div>\s*<label className="block text-xs font-medium text-slate-500 ml-1 mb-1">Lien du Service Client[\s\S]*?<\/div>/;

code = code.replace(regexGroup, "");
code = code.replace(regexSupport, "");

fs.writeFileSync('src/pages/Admin.tsx', code);
