const fs = require('fs');

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Replace logo and text
content = content.replace(/https:\/\/i.imgur.com\/20bDoyM.png/g, 'https://i.imgur.com/2QzGpuQ.png');
content = content.replace(/Limak/g, 'OlamAgri');

// Remove pseudo from state
content = content.replace(/pseudo: '',\s+/, '');
// Keep country but maybe not render it? The user said "seulement numéro...". Let's change the layout to not show country select.
// Remove the whole block for Identifiant
content = content.replace(/<div className="space-y-1\.5">\s*<label className="text-\[11px\].*?>Identifiant<\/label>[\s\S]*?<\/div>\s*<div className="space-y-1\.5">/m, '<div className="space-y-1.5">');

// Remove confirm password block
content = content.replace(/<div className="space-y-1\.5">\s*<label className="text-\[11px\].*?>Confirmer le mot de passe<\/label>[\s\S]*?<\/div>\s*<div className="grid/m, '<div className="grid');

// Remove the country select from grid
content = content.replace(/<div className="grid grid-cols-\[110px_1fr\] gap-2">[\s\S]*?<div className="space-y-1\.5">/m, '<div className="space-y-1.5">');
content = content.replace(/<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro<\/label>/, '<label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>');

// Change referral code generation since pseudo is gone
content = content.replace(/let myReferralCode = formData\.pseudo\.replace\(\/\\s\+\/g, ''\)\.toUpperCase\(\);/g, "let myReferralCode = 'USER' + formData.phone.slice(-4);");

// Remove the check for confirm password
content = content.replace(/if \(formData\.password !== formData\.confirmPassword\) {[\s\S]*?}/, '');
content = content.replace(/confirmPassword: '',\s+/, '');

// Add the banner image
content = content.replace(/<div className="text-center mb-8">/, `<div className="w-full h-32 mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <img src="https://i.imgur.com/u0FLYYs.png" alt="Banner" className="w-full h-full object-cover" />
            </div>
            <div className="text-center mb-8">`);

// Replace formData.pseudo with formData.phone in handleRegister
content = content.replace(/first_name: formData\.pseudo/g, "first_name: formData.phone");
// Handle the remaining closing div for the grid that we opened
// Since we removed `<div className="grid grid-cols-[110px_1fr] gap-2">` and `<div className="space-y-1.5">`...
// We need to properly remove the grid wrapping. Let's do it manually via a script or just edit the file using the edit tool.
fs.writeFileSync('src/pages/Register.tsx', content);
