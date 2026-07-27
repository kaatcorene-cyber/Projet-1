import fs from 'fs';

// --- REGISTER.TSX ---
let regContent = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const newRegPhoneBlock = `
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>
              <div className="flex gap-2">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-[120px] shrink-0 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold text-sm"
                >
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="Burkina">Burkina Faso</option>
                  <option value="Niger">Niger</option>
                </select>
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 text-slate-500 font-bold pointer-events-none">
                    {formData.country === 'Bénin' ? '+229' : formData.country === 'Togo' ? '+228' : formData.country === 'Burkina' ? '+226' : '+227'}
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-14 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="Votre numéro"
                    required
                  />
                </div>
              </div>
            </div>`;

// Replace the old phone block in Register.tsx
regContent = regContent.replace(/<div className="space-y-1\.5">\s*<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone<\/label>\s*<div className="flex gap-2">[\s\S]*?<\/div>\s*<\/div>/, newRegPhoneBlock);
fs.writeFileSync('src/pages/Register.tsx', regContent);

// --- LOGIN.TSX ---
let logContent = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// We need to add state for country in Login.tsx
if (!logContent.includes('const [country, setCountry]')) {
    logContent = logContent.replace("const [phone, setPhone] = useState('');", "const [phone, setPhone] = useState('');\n  const [country, setCountry] = useState('Bénin');");
}

const loginPhoneRegex = /<div className="space-y-1\.5">\s*<label className="text-\[11px\] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone<\/label>\s*<input\s*type="tel"\s*value=\{phone\}\s*onChange=\{\(e\) => setPhone\(e\.target\.value\)\}\s*className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2\.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"\s*placeholder="Votre numéro"\s*required\s*\/>\s*<\/div>/;

const newLogPhoneBlock = `
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Numéro de téléphone</label>
              <div className="flex gap-2">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-[120px] shrink-0 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold text-sm"
                >
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="Burkina">Burkina Faso</option>
                  <option value="Niger">Niger</option>
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                </select>
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 text-slate-500 font-bold pointer-events-none">
                    {country === 'Bénin' ? '+229' : country === 'Togo' ? '+228' : country === 'Burkina' ? '+226' : country === 'Niger' ? '+227' : '+225'}
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-14 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="Votre numéro"
                    required
                  />
                </div>
              </div>
            </div>`;

logContent = logContent.replace(loginPhoneRegex, newLogPhoneBlock);
fs.writeFileSync('src/pages/Login.tsx', logContent);

