import fs from 'fs';

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Extract the password block
let passwordBlockMatch = content.match(/<div className="space-y-1\.5">\s*<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Mot de passe<\/label>[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/);
let passwordBlock = passwordBlockMatch[0];

// Extract the phone block
let phoneBlockMatch = content.match(/<div className="space-y-1\.5">\s*<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone<\/label>[\s\S]*?<\/div>/);
let phoneBlock = phoneBlockMatch[0];

// Replace the original password block with the phone block
content = content.replace(passwordBlockMatch[0], '@@PHONE_BLOCK@@');
// Replace the original phone block with the password block
content = content.replace(phoneBlockMatch[0], '@@PASSWORD_BLOCK@@');

// Put them in
content = content.replace('@@PHONE_BLOCK@@', phoneBlock);
content = content.replace('@@PASSWORD_BLOCK@@', passwordBlock);

fs.writeFileSync('src/pages/Register.tsx', content);

