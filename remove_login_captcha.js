import fs from 'fs';

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Remove captcha block
content = content.replace(/<div className="space-y-1\.5">\s*<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest flex justify-between">\s*<span>Vérification<\/span>[\s\S]*?<\/div>\s*<\/div>/, '');

// Remove the validation logic
content = content.replace(/if \(userCaptcha !== captchaValue\) {[\s\S]*?return;\s*}/, '');

fs.writeFileSync('src/pages/Login.tsx', content);
