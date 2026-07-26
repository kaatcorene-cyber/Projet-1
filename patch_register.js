import fs from 'fs';

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

content = content.replace(/const handleChange = \(e: React\.ChangeEvent<HTMLInputElement \| HTMLSelectElement>\) => {[\s\S]*?const handleRegister = async/m, `const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleRegister = async`);

content = content.replace(/if \(formData\.password !== formData\.confirmPassword\) {[\s\S]*?}/, '');
content = content.replace(/const countryInfo = COUNTRIES\[formData\.country\];[\s\S]*?}\n/, '');
content = content.replace(/\.eq\('country', formData\.country\)/, '');
content = content.replace(/setError\('Ce numéro est déjà utilisé dans ce pays'\);/, "setError('Ce numéro est déjà utilisé');");

content = content.replace(/let myReferralCode = formData\.pseudo\.replace\(\/\\s\+\/g, ''\)\.toUpperCase\(\);[\s\S]*?const { data, error: insertError } =/m, `let myReferralCode = 'USER' + Math.floor(Math.random() * 1000000);
      let codeUnique = false;
      let finalCode = myReferralCode;
      
      while(!codeUnique) {
          const { data: existingRef } = await supabase.from('users').select('id').eq('referral_code', finalCode).maybeSingle();
          if (existingRef) {
              finalCode = 'USER' + Math.floor(Math.random() * 1000000);
          } else {
              codeUnique = true;
          }
      }

      const { data, error: insertError } =`);

content = content.replace(/first_name: formData\.pseudo,/, "first_name: cleanPhone,");

// Layout
const layoutStart = `<div className="text-center mb-8">`;
const newLayout = `<div className="w-full h-32 mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            <img src="https://i.imgur.com/u0FLYYs.png" alt="OlamAgri Banner" className="w-full h-full object-cover" />
          </div>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="https://i.imgur.com/2QzGpuQ.png" alt="OlamAgri" className="w-12 h-12 object-contain drop-shadow-md" referrerPolicy="no-referrer" />
              <h1 className="text-2xl grotesk font-black text-slate-900 tracking-tight">Inscription</h1>
            </div>
            <p className="text-slate-500 font-medium text-sm">Créez votre compte OlamAgri</p>
          </div>`;
content = content.replace(/<div className="text-center mb-8">[\s\S]*?Créez votre compte Limak<\/p>\s*<\/div>/, newLayout);

// Remove pseudo input
content = content.replace(/<div className="space-y-1\.5">\s*<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Identifiant<\/label>[\s\S]*?<\/div>\s*<div className="space-y-1\.5">/, '<div className="space-y-1.5">');

// Remove confirm password
content = content.replace(/<div className="space-y-1\.5">\s*<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Confirmer le mot de passe<\/label>[\s\S]*?<\/div>\s*<div className="grid grid-cols-\[110px_1fr\] gap-2">/, '<div className="grid grid-cols-[110px_1fr] gap-2">');

// Remove grid and country, change to phone
content = content.replace(/<div className="grid grid-cols-\[110px_1fr\] gap-2">[\s\S]*?<div className="space-y-1\.5">\s*<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro<\/label>[\s\S]*?<\/div>\s*<\/div>/, `<div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Votre numéro"
                required
              />
            </div>`);

fs.writeFileSync('src/pages/Register.tsx', content);

// ALSO DO LOGIN.TSX
let loginContent = fs.readFileSync('src/pages/Login.tsx', 'utf8');
const newLoginLayout = `<div className="w-full h-32 mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            <img src="https://i.imgur.com/7n8lU6k.jpeg" alt="OlamAgri Banner" className="w-full h-full object-cover" />
          </div>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="https://i.imgur.com/2QzGpuQ.png" alt="OlamAgri" className="w-12 h-12 object-contain drop-shadow-md" referrerPolicy="no-referrer" />
              <h1 className="text-2xl grotesk font-black text-slate-900 tracking-tight">Connexion</h1>
            </div>
            <p className="text-slate-500 font-medium text-sm">Connectez-vous à votre compte OlamAgri</p>
          </div>`;

loginContent = loginContent.replace(/<div className="text-center mb-8">[\s\S]*?Connectez-vous à votre compte Limak<\/p>\s*<\/div>/, newLoginLayout);
// Change pseudo to phone
loginContent = loginContent.replace(/pseudo/g, 'phone');
loginContent = loginContent.replace(/<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Identifiant<\/label>/, '<label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>');
loginContent = loginContent.replace(/\.eq\('first_name', phone\)/, ".eq('phone', phone)");
loginContent = loginContent.replace(/placeholder="Ex: Pablito"/, 'placeholder="Votre numéro"');
loginContent = loginContent.replace(/type="text"/, 'type="tel"'); // For phone field, it's the first input

fs.writeFileSync('src/pages/Login.tsx', loginContent);

